/* eslint-disable prettier/prettier */
import { HttpException, Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from 'src/users/schema/users.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { hash, compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Admins, AdminsDocument } from 'src/admins/schema/admins.schema';
import { RegisterAdminAuthDto } from './dto/registerAdmin-auth.dto';
import { LoginAdminAuthDto } from './dto/loginAdmin-auth.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UsersDocument>, 
    @InjectModel(Admins.name) private readonly adminModel: Model<AdminsDocument>,
    private jwtAuthService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const { email } = userObject;
    const findUser = await this.userModel.findOne({ email: email });
    if (findUser) throw new HttpException('USER_EXIST', 402);
    const { password } = userObject;
    const plainToHash = await hash(password, 10);
    userObject = { ...userObject, password: plainToHash };
    //  try {
    //   this.mailerService.sendMail({
    //   to: email, //a donde va el correo
    // from: 'alejandroaml0528@gmail.com', //no se para que sirve
    //subject: 'MENSAJE DE BIENVENIDA A LA APLICACION', //Texto que va cuando llega el msj
    //html: '<h2> HOLA BIENVENIDO A TROVETRADERS </h2><b>ESTO ES UN TESTING</b>', //cuerpo del mensaje
    //});
    //} catch (error) {
    //console.log(error);
    //   }
    return this.userModel.create(userObject);
  }

  async login(userObjectLogin: LoginAuthDto) {
    const { email, password } = userObjectLogin;
    const findUser = await this.userModel.findOne({ email: email });
    if (!findUser) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(password, findUser.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const payload = {
      id: findUser._id,
      name: findUser.name,
      lastName: findUser.lastName,
    };
    const token = this.jwtAuthService.sign(payload);


    const data = {
      user: findUser,
      token,
    };

    delete data.user.password;
    return data;
  }
  async resendEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    // Generar un nuevo token de verificación con JWT
    const verificationToken = await this.generateVerificationToken(
      user._id.toString(),
    );

    await this.sendVerificationEmail(user.email, verificationToken);

    // Enviar el correo electrónico de verificación

    return { message: 'Email verification send' };
  }

  async generateVerificationToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtAuthService.sign(payload);
  }

  async sendVerificationEmail(userEmail, verificationLink) {
    try {
      this.mailerService.sendMail({
        to: userEmail, //a donde va el correo
        from: 'alejandroaml0528@gmail.com', //no se para que sirve
        subject: 'Verifica tu Correo', //Texto que va cuando llega el msj
        html: `<p>Hola,</p><p>Por favor, verifica tu correo electrónico haciendo clic en el
         siguiente enlace: </p><a href="http://localhost:5173/email-verification/${verificationLink}/test">Verifica tu cuenta</a>`, //cuerpo del mensaje
      });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyEmail(token: string) {
    const decodedToken = this.jwtAuthService.verify(token);
    const userId = decodedToken.sub;

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.verificationEmail = true;
    await user.save();
  }

  async registerAdmin(adminObject: RegisterAdminAuthDto) {
    const { email } = adminObject;
    const findUser = await this.adminModel.findOne({ email: email });
    if (findUser) throw new HttpException('USER_EXIST', 402);
    const { password } = adminObject;
    const plainToHash = await hash(password, 10);
    adminObject = { ...adminObject, password: plainToHash };



    return this.adminModel.create(adminObject);
  }
  async loginAdmin(adminObjectLogin: LoginAdminAuthDto) {
    const { email, password } = adminObjectLogin;
    const findUser = await this.adminModel.findOne({ email: email });
    if (!findUser) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(password, findUser.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const payload = {
      id: findUser._id,
      name: findUser.name,
      lastName: findUser.lastName,
    };
    const token = this.jwtAuthService.sign(payload);


    const data = {
      user: findUser,
      token,
    };

    delete data.user.password;
    return data;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<boolean> {
    console.log('changePassword')
    console.log('User ID:', id);
    console.log('Change Password DTO:', changePasswordDto);

    try {

      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      console.log('User Information:', user);
      console.log('Password:', changePasswordDto.password)
      console.log('hashed:', user.password)

      const isPasswordMatch = await bcrypt.compare(changePasswordDto.password, user.password);
      console.log('true or false:', isPasswordMatch)
      
      if (!isPasswordMatch) {
        return false;
      }

      const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
      user.password = newPasswordHash;
      await user.save();
      return true;

    } catch (error) {
      throw error;
    }
  }

  async changePasswordbyToken(token:string,changePasswordDto: ChangePasswordDto): Promise<boolean> {
    console.log('changePasswordByToken')
    try {
    console.log('Received Token:', token);

    const decodedToken = this.jwtAuthService.verify(token);
    console.log('Decoded Token:', decodedToken);
    const userId = decodedToken.sub;

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    console.log('User Information:', user);
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = newPasswordHash;
    await user.save();
    
    return true;
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  }

  async sendRecoveryEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const recoveryToken = await this.generateVerificationToken(
      user._id.toString(),
    );

    await this.sendRecovery(user.email, recoveryToken);

    return { message: 'Correo de Recuperacion enviado' };
  }

  async sendRecovery(userEmail, recoveryLink) {
    try {
      this.mailerService.sendMail({
        to: userEmail,
        from: 'alejandroaml0528@gmail.com',
        subject: 'Recupera tu contraseña',
        html: 
        `<p>Hola,</p>
        <p>Has solicitado la recuperacion de tu contraseña: </p>
        <a href="http://localhost:5173/recover-password/${recoveryLink}/test">Cambia tu contraseña.</a>`,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

