import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from 'src/users/schema/users.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { hash, compare } from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UsersDocument>,
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
    try {
      this.mailerService.sendMail({
        to: email, //a donde va el correo
        from: 'alejandroaml0528@gmail.com', //no se para que sirve
        subject: 'MENSAJE DE BIENVENIDA A LA APLICACION', //Texto que va cuando llega el msj
        html: '<h2> HOLA BIENVENIDO A TROVETRADERS </h2><b>ESTO ES UN TESTING</b>', //cuerpo del mensaje
      });
    } catch (error) {
      console.log(error);
    }
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
}
