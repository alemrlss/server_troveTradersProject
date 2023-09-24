/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterAdminAuthDto } from './dto/registerAdmin-auth.dto';
import { LoginAdminAuthDto } from './dto/loginAdmin-auth.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  create(@Body() userObject: RegisterAuthDto) {
    return this.authService.register(userObject);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  loginUser(@Body() userObjectLogin: LoginAuthDto) {
    return this.authService.login(userObjectLogin);
  }
  @Post('verification-email')
  @ApiOperation({ summary: 'Verification email' })
  verificationEmail(@Body() { email }: RegisterAuthDto) {
    return this.authService.resendEmail(email);
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Param('token') token: string) {
    try {
      await this.authService.verifyEmail(token);
      return {
        message:
          'Your account has been successfully verified. Now you can access all the functions of the application.',
      };
    } catch (error) {
      throw new NotFoundException(
        'Token de verificación inválido o expirado. Por favor, verifica tu correo electrónico nuevamente.',
      );
    }
  }
  //edit
  @Post('edit-password/:id')
  async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(id, changePasswordDto);
  }
  
  @Post('registerAdmin')
  @ApiOperation({ summary: 'Register Admin' })
  createAdmin(@Body() adminObject: RegisterAdminAuthDto) {
    return this.authService.registerAdmin(adminObject);
  }
  @Post('loginAdmin')
  @ApiOperation({ summary: 'Login Admin' })
  loginAdmin(@Body() adminObjectLogin: LoginAdminAuthDto) {
    return this.authService.loginAdmin(adminObjectLogin);
  }
  
}
