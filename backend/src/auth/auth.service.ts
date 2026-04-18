import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterNineraDto } from './dto/register-ninera.dto';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getVerificationBaseUrl() {
    const baseUrl = process.env.BACKEND_PUBLIC_URL?.trim();

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'Configura BACKEND_PUBLIC_URL para enviar correos de verificacion',
      );
    }

    return baseUrl.replace(/\/$/, '');
  }

  private getEmailFrom() {
    const emailFrom = process.env.RESEND_FROM_EMAIL?.trim();

    if (!emailFrom) {
      throw new InternalServerErrorException(
        'Configura RESEND_FROM_EMAIL para enviar correos de verificacion',
      );
    }

    return emailFrom;
  }

  private getResendApiKey() {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Configura RESEND_API_KEY para enviar correos de verificacion',
      );
    }

    return apiKey;
  }

  private hashVerificationToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildVerificationHtml(verificationUrl: string, nombre?: string | null) {
    const saludo = nombre?.trim() ? `Hola ${nombre.trim()},` : 'Hola,';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
        <h1 style="color: #111827;">Verifica tu correo en Nani</h1>
        <p>${saludo}</p>
        <p>Gracias por registrarte. Para activar tu cuenta de cliente, confirma tu correo con el siguiente boton:</p>
        <p style="margin: 32px 0;">
          <a href="${verificationUrl}" style="background: #ff768a; color: white; padding: 14px 22px; border-radius: 10px; text-decoration: none; display: inline-block;">Verificar mi correo</a>
        </p>
        <p>Si el boton no abre, copia este enlace en tu navegador:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Este enlace vence en 24 horas.</p>
      </div>
    `;
  }

  private renderVerificationPage(options: {
    title: string;
    message: string;
    accent: string;
  }) {
    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      <section style="max-width:560px;width:100%;background:#fff;border-radius:24px;padding:32px;box-shadow:0 20px 40px rgba(15,23,42,.08);text-align:center;">
        <div style="width:72px;height:72px;border-radius:9999px;background:${options.accent};margin:0 auto 20px;"></div>
        <h1 style="margin:0 0 12px;font-size:28px;">${options.title}</h1>
        <p style="margin:0;font-size:16px;line-height:1.6;">${options.message}</p>
      </section>
    </main>
  </body>
</html>`;
  }

  private async sendVerificationEmail(params: {
    correo: string;
    nombre?: string | null;
    token: string;
  }) {
    const verificationUrl = `${this.getVerificationBaseUrl()}/auth/verify-email?token=${encodeURIComponent(params.token)}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getResendApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.getEmailFrom(),
        to: params.correo,
        subject: 'Verifica tu correo en Nani',
        html: this.buildVerificationHtml(verificationUrl, params.nombre),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(
        `No se pudo enviar el correo de verificacion: ${errorText}`,
      );
    }
  }

  private async createAndSendVerificationEmail(params: {
    clienteId: string;
    correo: string;
    nombre?: string | null;
  }) {
    const admin = this.supabaseService.getAdminClient();
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { error: updateError } = await admin
      .from('cliente')
      .update({
        email_verificado: false,
        email_verification_token_hash: this.hashVerificationToken(token),
        email_verification_sent_at: now.toISOString(),
        email_verification_expires_at: expiresAt.toISOString(),
      })
      .eq('id', params.clienteId);

    if (updateError) {
      throw new InternalServerErrorException(
        `No se pudo guardar el token de verificacion: ${updateError.message}`,
      );
    }

    await this.sendVerificationEmail({
      correo: params.correo,
      nombre: params.nombre,
      token,
    });
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getPublicClient();
    const admin = this.supabaseService.getAdminClient();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: dto.correo,
          password: dto.password,
        });

      if (authError || !authData.user) {
        throw new UnauthorizedException('Correo o contraseña incorrectos');
      }

      const authUserId = authData.user.id;

      const { data: usuario, error: usuarioError } = await admin
        .from('usuario')
        .select(
          `
          id,
          auth_id,
          correo,
          rol,
          fecha_registro,
          ninera ( verificada ),
          cliente ( email_verificado )
        `,
        )
        .eq('auth_id', authUserId)
        .maybeSingle();

      if (usuarioError) {
        console.error('Error obteniendo usuario en login:', usuarioError);
        throw new InternalServerErrorException(
          `Error de base de datos: ${usuarioError.message}`,
        );
      }

      if (!usuario) {
        throw new UnauthorizedException(
          'El usuario autenticado no existe en la tabla usuario',
        );
      }

      if (usuario.rol === 'ninera') {
        const datosNinera = Array.isArray(usuario.ninera)
          ? usuario.ninera[0]
          : usuario.ninera;

        if (!datosNinera || datosNinera.verificada === false) {
          throw new UnauthorizedException(
            'Tu perfil está siendo revisado todavía. Te avisaremos por correo cuando sea aprobado.',
          );
        }
      }

      if (usuario.rol === 'cliente') {
        const datosCliente = Array.isArray(usuario.cliente)
          ? usuario.cliente[0]
          : usuario.cliente;

        if (!datosCliente?.email_verificado) {
          throw new ForbiddenException({
            message:
              'Debes verificar tu correo antes de iniciar sesion. Revisa tu bandeja de entrada.',
            requiresEmailVerification: true,
            correo: usuario.correo,
          });
        }
      }

      const datosNinera =
        usuario.rol === 'ninera'
          ? Array.isArray(usuario.ninera)
            ? usuario.ninera[0]
            : usuario.ninera
          : null;
      const datosCliente =
        usuario.rol === 'cliente'
          ? Array.isArray(usuario.cliente)
            ? usuario.cliente[0]
            : usuario.cliente
          : null;

      return {
        message: 'Login exitoso',
        session: authData.session,
        user: {
          ...usuario,
          email_verificado:
            usuario.rol === 'cliente'
              ? datosCliente?.email_verificado ?? false
              : null,
          verificada:
            usuario.rol === 'ninera' ? datosNinera?.verificada ?? false : null,
        },
      };
    } catch (err) {
      console.error('Error en login:', err);

      if (
        err instanceof ForbiddenException ||
        err instanceof UnauthorizedException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Error interno en login');
    }
  }

  async getMe(token: string | null) {
    const supabase = this.supabaseService.getPublicClient();
    const admin = this.supabaseService.getAdminClient();

    if (!token) {
      throw new UnauthorizedException('Token no enviado');
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser(token);

      if (authError || !authData.user) {
        throw new UnauthorizedException('Sesión expirada o token inválido');
      }

      const { data: usuario, error: usuarioError } = await admin
        .from('usuario')
        .select('id, auth_id, correo, rol, fecha_registro')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (usuarioError) {
        console.error('Error obteniendo usuario en getMe:', usuarioError);
        throw new InternalServerErrorException(
          `Error de base de datos: ${usuarioError.message}`,
        );
      }

      if (!usuario) {
        throw new UnauthorizedException('Usuario no existe en la base de datos');
      }

      if (usuario.rol === 'cliente') {
        const { data: cliente, error: clienteError } = await admin
          .from('cliente')
          .select(
            `
            id,
            email_verificado,
            persona:persona_id (
              id,
              nombre,
              apellido,
              foto_url,
              telefono,
              fecha_nacimiento,
              DNI_frontal_url,
              DNI_reverso_url
            )
          `,
          )
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (clienteError) {
          console.error('Error obteniendo cliente en getMe:', clienteError);
          throw new InternalServerErrorException(
            `Error de base de datos: ${clienteError.message}`,
          );
        }

        return {
          id: usuario.id,
          auth_id: usuario.auth_id,
          correo: usuario.correo,
          rol: usuario.rol,
          fecha_registro: usuario.fecha_registro,
          email_verificado: cliente?.email_verificado ?? false,
          persona: cliente?.persona || null,
        };
      }

      if (usuario.rol === 'ninera') {
        const { data: ninera, error: nineraError } = await admin
          .from('ninera')
          .select(
            `
            id,
            verificada,
            persona:persona_id (
              id,
              nombre,
              apellido,
              telefono,
              foto_url
            )
          `,
          )
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (nineraError) {
          console.error('Error obteniendo niñera en getMe:', nineraError);
          throw new InternalServerErrorException(
            `Error de base de datos: ${nineraError.message}`,
          );
        }

        return {
          id: usuario.id,
          auth_id: usuario.auth_id,
          correo: usuario.correo,
          rol: usuario.rol,
          fecha_registro: usuario.fecha_registro,
          verificada: ninera?.verificada ?? false,
          persona: ninera?.persona || null,
        };
      }

      return {
        id: usuario.id,
        auth_id: usuario.auth_id,
        correo: usuario.correo,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro,
        persona: null,
      };
    } catch (err) {
      console.error('Error en getMe:', err);

      if (
        err instanceof UnauthorizedException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error interno al obtener usuario',
      );
    }
  }

  async registerNinera(dto: RegisterNineraDto, files: any) {
    const admin = this.supabaseService.getAdminClient();

    const uploadFile = async (file: Express.Multer.File, bucket: string) => {
      const safeName = file.originalname.replace(/[^\w.\-]/g, '_');
      const fileName = `${Date.now()}-${safeName}`;

      const { error } = await admin.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new BadRequestException(
          `Error subiendo archivo: ${error.message}`,
        );
      }

      const {
        data: { publicUrl },
      } = admin.storage.from(bucket).getPublicUrl(fileName);

      if (!publicUrl) {
        throw new InternalServerErrorException(
          'No se pudo obtener URL del archivo',
        );
      }

      return publicUrl;
    };

    const normalizeInput = (input: any) => {
      if (!input) return [];
      return Array.isArray(input)
        ? input
        : input
            .split(',')
            .map((i: string) => i.trim())
            .filter(Boolean);
    };

    try {
      let urlFoto = '';
      let urlFrontal = '';
      let urlReverso = '';
      let urlAntecedentes = '';

      if (files?.foto_url?.[0]) {
        urlFoto = await uploadFile(files.foto_url[0], 'documentos');
      }

      if (files?.DNI_frontal_url?.[0]) {
        urlFrontal = await uploadFile(files.DNI_frontal_url[0], 'documentos');
      }

      if (files?.DNI_reverso_url?.[0]) {
        urlReverso = await uploadFile(files.DNI_reverso_url[0], 'documentos');
      }

      if (files?.Antecedentes_penales_url?.[0]) {
        urlAntecedentes = await uploadFile(
          files.Antecedentes_penales_url[0],
          'documentos',
        );
      }

      const { data: authCreated, error: authError } =
        await admin.auth.admin.createUser({
          email: dto.correo,
          password: dto.password,
          email_confirm: true,
        });

      if (authError || !authCreated.user) {
        throw new BadRequestException(
          authError?.message || 'No se pudo crear el usuario en Auth',
        );
      }

      const authUserId = authCreated.user.id;

      const { data: usuario, error: usuarioError } = await admin
        .from('usuario')
        .insert({
          auth_id: authUserId,
          correo: dto.correo,
          rol: 'ninera',
        })
        .select()
        .single();

      if (usuarioError) {
        throw new BadRequestException(
          `Error en tabla usuario: ${usuarioError.message}`,
        );
      }

      const { data: direccion, error: direccionError } = await admin
        .from('direccion')
        .insert({
          direccion_completa: dto.ubicacion,
          latitud: 0,
          longitud: 0,
          punto_referencia: null,
        })
        .select()
        .single();

      if (direccionError) {
        throw new BadRequestException(
          `Error en tabla direccion: ${direccionError.message}`,
        );
      }

      const { data: persona, error: personaError } = await admin
        .from('persona')
        .insert({
          nombre: dto.nombre,
          apellido: dto.apellido,
          telefono: dto.telefono,
          id_direccion: direccion.id,
          fecha_nacimiento: dto.fecha_nacimiento || null,
          foto_url: urlFoto || null,
          DNI_frontal_url: urlFrontal || null,
          DNI_reverso_url: urlReverso || null,
        })
        .select()
        .single();

      if (personaError) {
        throw new BadRequestException(
          `Error en tabla persona: ${personaError.message}`,
        );
      }

      const { data: ninera, error: nineraError } = await admin
        .from('ninera')
        .insert({
          persona_id: persona.id,
          usuario_id: usuario.id,
          presentacion: dto.presentacion ?? null,
          experiencia: dto.experiencia ?? null,
          Antecedentes_penales_url: urlAntecedentes || null,
          tarifa: Number(dto.tarifa),
          verificada: false,
        })
        .select()
        .single();

      if (nineraError) {
        throw new BadRequestException(
          `Error en tabla ninera: ${nineraError.message}`,
        );
      }

      const listaHabilidades = normalizeInput(dto.habilidades);
      if (listaHabilidades.length > 0) {
        const insertHabs = listaHabilidades.map((h: string) => ({
          ninera_id: ninera.id,
          nombre: h,
        }));

        const { error: habError } = await admin
          .from('habilidad_ninera')
          .insert(insertHabs);

        if (habError) {
          throw new BadRequestException(
            `Error en habilidades: ${habError.message}`,
          );
        }
      }

      const listaCerts = normalizeInput(dto.certificaciones);
      if (listaCerts.length > 0) {
        const insertCerts = listaCerts.map((c: string) => ({
          ninera_id: ninera.id,
          nombre: c,
        }));

        const { error: certError } = await admin
          .from('certificaciones_ninera')
          .insert(insertCerts);

        if (certError) {
          throw new BadRequestException(
            `Error en certificaciones: ${certError.message}`,
          );
        }
      }

      return {
        message:
          'Niñera registrada correctamente. Recibirás un correo para el siguiente paso',
        user: {
          auth_id: authUserId,
          usuario_id: usuario.id,
          ninera_id: ninera.id,
          persona_id: persona.id,
          direccion_id: direccion.id,
        },
      };
    } catch (err) {
      console.error('Error en registerNinera:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error interno al registrar niñera',
      );
    }
  }

  async registerCliente(dto: RegisterClienteDto, files: any) {
    const admin = this.supabaseService.getAdminClient();

    const uploadFile = async (
      file: Express.Multer.File[] | undefined,
      bucket: string,
    ) => {
      if (!file || !file[0]) return null;

      const fileData = file[0];
      const safeName = (fileData.originalname || 'archivo').replace(
        /[^\w.\-]/g,
        '_',
      );
      const fileName = `cliente-${Date.now()}-${safeName}`;

      const { error } = await admin.storage
        .from(bucket)
        .upload(fileName, fileData.buffer, {
          contentType: fileData.mimetype,
          upsert: true,
        });

      if (error) {
        throw new BadRequestException(`Error storage: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = admin.storage.from(bucket).getPublicUrl(fileName);

      if (!publicUrl) {
        throw new InternalServerErrorException(
          'No se pudo obtener URL del archivo',
        );
      }

      return publicUrl;
    };

    try {
      const urlFoto = await uploadFile(files?.foto_url, 'documentos');
      const urlDni = await uploadFile(files?.DNI_frontal_url, 'documentos');
      const urlDniReverso = await uploadFile(
        files?.DNI_reverso_url,
        'documentos',
      );

      const { data: authCreated, error: authError } =
        await admin.auth.admin.createUser({
          email: dto.correo,
          password: dto.password,
          email_confirm: true,
        });

      if (authError || !authCreated.user) {
        throw new BadRequestException(
          authError?.message || 'No se pudo crear el usuario',
        );
      }

      const { data: usuario, error: uError } = await admin
        .from('usuario')
        .insert({
          auth_id: authCreated.user.id,
          correo: dto.correo,
          rol: 'cliente',
        })
        .select()
        .single();

      if (uError) {
        throw new BadRequestException(`Error en tabla usuario: ${uError.message}`);
      }

      const { data: persona, error: pError } = await admin
        .from('persona')
        .insert({
          nombre: dto.nombre,
          apellido: dto.apellido,
          telefono: dto.telefono || null,
          id_direccion: null,
          fecha_nacimiento: dto.fecha_nacimiento || null,
          foto_url: urlFoto,
          DNI_frontal_url: urlDni,
          DNI_reverso_url: urlDniReverso,
        })
        .select()
        .single();

      if (pError) {
        throw new BadRequestException(`Error en tabla persona: ${pError.message}`);
      }

      const { error: cError } = await admin.from('cliente').insert({
        persona_id: persona.id,
        usuario_id: usuario.id,
        email_verificado: false,
      });

      if (cError) {
        throw new BadRequestException(`Error en tabla cliente: ${cError.message}`);
      }

      const { data: clienteCreado, error: clienteFetchError } = await admin
        .from('cliente')
        .select('id')
        .eq('usuario_id', usuario.id)
        .maybeSingle();

      if (clienteFetchError || !clienteCreado) {
        throw new InternalServerErrorException(
          `No se pudo obtener el cliente creado: ${clienteFetchError?.message || 'Sin resultados'}`,
        );
      }

      await this.createAndSendVerificationEmail({
        clienteId: clienteCreado.id,
        correo: dto.correo,
        nombre: dto.nombre,
      });

      return {
        message:
          'Cliente registrado con exito. Te enviamos un correo para verificar tu cuenta.',
        userId: authCreated.user.id,
        requiresEmailVerification: true,
      };
    } catch (err) {
      console.error('Error en registerCliente:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error interno al registrar cliente',
      );
    }
  }

  async resendClienteVerificationEmail(correo: string) {
    const admin = this.supabaseService.getAdminClient();
    const normalizedEmail = correo.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException('El correo es obligatorio');
    }

    const { data: usuario, error: usuarioError } = await admin
      .from('usuario')
      .select(
        `
        id,
        correo,
        rol,
        cliente (
          id,
          email_verificado,
          persona:persona_id (
            nombre
          )
        )
      `,
      )
      .eq('correo', normalizedEmail)
      .eq('rol', 'cliente')
      .maybeSingle();

    if (usuarioError) {
      throw new InternalServerErrorException(
        `Error consultando usuario: ${usuarioError.message}`,
      );
    }

    if (!usuario) {
      throw new NotFoundException('No existe un cliente con ese correo');
    }

    const cliente = Array.isArray(usuario.cliente)
      ? usuario.cliente[0]
      : usuario.cliente;

    if (!cliente) {
      throw new BadRequestException('No se encontro el perfil del cliente');
    }

    if (cliente.email_verificado) {
      return {
        message: 'Este correo ya esta verificado. Ya puedes iniciar sesion.',
        alreadyVerified: true,
      };
    }

    const persona = Array.isArray(cliente.persona)
      ? cliente.persona[0]
      : cliente.persona;

    await this.createAndSendVerificationEmail({
      clienteId: cliente.id,
      correo: normalizedEmail,
      nombre: persona?.nombre,
    });

    return {
      message: 'Te enviamos un nuevo correo de verificacion.',
      requiresEmailVerification: true,
    };
  }

  async verifyClienteEmail(token: string) {
    const admin = this.supabaseService.getAdminClient();

    if (!token?.trim()) {
      return this.renderVerificationPage({
        title: 'Enlace invalido',
        message: 'El enlace de verificacion no incluye un token valido.',
        accent: '#f59e0b',
      });
    }

    const { data: cliente, error } = await admin
      .from('cliente')
      .select('id, email_verificado, email_verification_expires_at')
      .eq('email_verification_token_hash', this.hashVerificationToken(token))
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error consultando token: ${error.message}`,
      );
    }

    if (!cliente) {
      return this.renderVerificationPage({
        title: 'Enlace no valido',
        message:
          'No encontramos una solicitud de verificacion con este enlace. Pide un nuevo correo desde la app.',
        accent: '#ef4444',
      });
    }

    if (cliente.email_verificado) {
      return this.renderVerificationPage({
        title: 'Correo ya verificado',
        message: 'Tu cuenta ya estaba verificada. Ya puedes iniciar sesion en Nani.',
        accent: '#22c55e',
      });
    }

    if (
      cliente.email_verification_expires_at &&
      new Date(cliente.email_verification_expires_at).getTime() < Date.now()
    ) {
      return this.renderVerificationPage({
        title: 'Enlace vencido',
        message:
          'Este enlace ya vencio. Vuelve a la app y solicita un nuevo correo de verificacion.',
        accent: '#f59e0b',
      });
    }

    const { error: updateError } = await admin
      .from('cliente')
      .update({
        email_verificado: true,
        email_verificado_at: new Date().toISOString(),
        email_verification_token_hash: null,
        email_verification_expires_at: null,
      })
      .eq('id', cliente.id);

    if (updateError) {
      throw new InternalServerErrorException(
        `No se pudo actualizar la verificacion: ${updateError.message}`,
      );
    }

    return this.renderVerificationPage({
      title: 'Correo verificado',
      message: 'Tu cuenta ya quedo verificada. Ahora si puedes iniciar sesion en Nani.',
      accent: '#22c55e',
    });
  }

  async completeProfile(userId: string, dto: any, files: any) {
    const admin = this.supabaseService.getAdminClient();

    const uploadFile = async (
      file: Express.Multer.File[] | undefined,
      bucket: string,
      prefix: string,
    ) => {
      if (!file || !file[0]) return null;

      const fileData = file[0];
      const extSafeName = (fileData.originalname || 'archivo').replace(
        /[^\w.\-]/g,
        '_',
      );
      const fileName = `${prefix}-${userId}-${Date.now()}-${extSafeName}`;

      const { error } = await admin.storage
        .from(bucket)
        .upload(fileName, fileData.buffer, {
          contentType: fileData.mimetype,
          upsert: true,
        });

      if (error) {
        throw new BadRequestException(
          `Error subiendo ${prefix}: ${error.message}`,
        );
      }

      const {
        data: { publicUrl },
      } = admin.storage.from(bucket).getPublicUrl(fileName);

      if (!publicUrl) {
        throw new InternalServerErrorException(
          'No se pudo obtener URL del archivo',
        );
      }

      return publicUrl;
    };

    try {
      const urlFotoPerfil = await uploadFile(
        files?.foto_url,
        'perfiles',
        'avatar',
      );
      const urlDniFrontal = await uploadFile(
        files?.DNI_frontal_url,
        'documentos',
        'dni-f',
      );
      const urlDniReverso = await uploadFile(
        files?.DNI_reverso_url,
        'documentos',
        'dni-r',
      );

      const { data: cliente, error: clientError } = await admin
        .from('cliente')
        .select('id, persona_id')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (clientError) {
        throw new InternalServerErrorException(
          `Error de base de datos: ${clientError.message}`,
        );
      }

      if (!cliente) {
        throw new BadRequestException('Cliente no encontrado');
      }

      let direccionId = null;

      if (dto.direccion || dto.ubicacion) {
        const coords =
          typeof dto.ubicacion === 'string' ? dto.ubicacion.split(',') : [];
        const lat = coords[0] ? parseFloat(coords[0]) : null;
        const lng = coords[1] ? parseFloat(coords[1]) : null;

        const { data: personaActual, error: personaActualError } = await admin
          .from('persona')
          .select('id_direccion')
          .eq('id', cliente.persona_id)
          .maybeSingle();

        if (personaActualError) {
          throw new InternalServerErrorException(
            `Error de base de datos: ${personaActualError.message}`,
          );
        }

        if (personaActual?.id_direccion) {
          const { error: updateDireccionError } = await admin
            .from('direccion')
            .update({
              direccion_completa: dto.direccion,
              punto_referencia: dto.punto_referencia,
              latitud: lat,
              longitud: lng,
            })
            .eq('id', personaActual.id_direccion);

          if (updateDireccionError) {
            throw new BadRequestException(
              `Error actualizando dirección: ${updateDireccionError.message}`,
            );
          }

          direccionId = personaActual.id_direccion;
        } else {
          const { data: nuevaDir, error: nuevaDirError } = await admin
            .from('direccion')
            .insert({
              direccion_completa: dto.direccion,
              punto_referencia: dto.punto_referencia,
              latitud: lat,
              longitud: lng,
            })
            .select('id')
            .single();

          if (nuevaDirError) {
            throw new BadRequestException(
              `Error creando dirección: ${nuevaDirError.message}`,
            );
          }

          direccionId = nuevaDir.id;
        }
      }

      const { error: updateError } = await admin
        .from('persona')
        .update({
          telefono: dto.telefono,
          id_direccion: direccionId,
          fecha_nacimiento: dto.fecha_nacimiento,
          ...(urlFotoPerfil && { foto_url: urlFotoPerfil }),
          ...(urlDniFrontal && { DNI_frontal_url: urlDniFrontal }),
          ...(urlDniReverso && { DNI_reverso_url: urlDniReverso }),
        })
        .eq('id', cliente.persona_id);

      if (updateError) {
        throw new BadRequestException(
          `Error al actualizar perfil: ${updateError.message}`,
        );
      }

      if (dto.ninos) {
        try {
          const listaNinos =
            typeof dto.ninos === 'string' ? JSON.parse(dto.ninos) : dto.ninos;

          if (Array.isArray(listaNinos) && listaNinos.length > 0) {
            const ninosInsert = listaNinos.map((n: any) => ({
              cliente_id: cliente.id,
              nombre: n.nombre,
              edad: parseInt(n.edad, 10),
              nota: n.nota || null,
            }));

            const { error: ninosError } = await admin
              .from('nino')
              .insert(ninosInsert);

            if (ninosError) {
              console.error('Error guardando niños:', ninosError.message);
              throw new BadRequestException(
                `Error guardando niños: ${ninosError.message}`,
              );
            }
          }
        } catch (e: any) {
          console.error('Error al procesar JSON de niños:', e?.message);

          if (e instanceof BadRequestException) {
            throw e;
          }

          throw new BadRequestException('Formato inválido en el campo ninos');
        }
      }

      return { message: 'Perfil de Nani completado con éxito' };
    } catch (err) {
      console.error('Error en completeProfile:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error interno al completar perfil',
      );
    }
  }
}


