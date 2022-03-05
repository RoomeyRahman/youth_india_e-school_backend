import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  UsePipes,
  HttpStatus,
  HttpException,
  Headers,
  MethodNotAllowedException,
} from '@nestjs/common';
import { UsersService } from '../services';
import { CreateUserDTO, EmailDTO, PasswordDTO } from '../dto';
import { IUser } from '../interfaces';
import { ValidationPipe } from '../../common/pipes/validation.pipe';
import { TrimPipe } from '../../common/pipes/trim.pipe';
import {
  ApiBasicAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiHeader,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { NullValidationPipe } from '../../common/pipes/null-validator.pipe';

/**
 * User Controller
 */
@ApiTags('User')
@ApiResponse({
  status: HttpStatus.METHOD_NOT_ALLOWED,
  description: 'Method not allowed',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Server Error!',
})
@Controller('user')
export class UsersController {
  /**
   * Constructor
   * @param {UsersService} usersService
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a user
   * @Body {CreateUserDTO} createUserDTO
   * @returns {Promise<IUser>} created user data
   */
  @ApiOperation({ summary: 'User registration: create new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Return new user.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Record already exist',
  })
  @UsePipes(new NullValidationPipe())
  @UsePipes(new ValidationPipe(true))
  @UsePipes(new TrimPipe())
  @Post('register')
  public async register(@Body() createUserDTO: CreateUserDTO): Promise<IUser> {
    try {
      return await this.usersService.register(createUserDTO);
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @ApiExcludeEndpoint()
  @Get('register')
  public registerGet() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Put('register')
  public registerPut() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Patch('register')
  public registerPatch() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Delete('register')
  public registerDelete() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  /******Password Reset*******/
  /**
   * generate password reset token
   * @param {EmailDTO} emailDTO
   * @returns {Promise<object>}
   */
  @ApiOperation({ summary: 'Password reset token generate link' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return new otp for verification.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data',
  })
  @Post('reset-password/generate/link')
  public generatePasswordResetToken(
    @Body() emailDTO: EmailDTO,
  ): Promise<Record<any, any>> {
    try {
      return this.usersService.generatePasswordResetToken(emailDTO.email);
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @ApiExcludeEndpoint()
  @Get('reset-password/generate/link')
  public generatePasswordResetTokenGet() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Put('reset-password/generate/link')
  public generatePasswordResetTokenPut() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Patch('reset-password/generate/link')
  public generatePasswordResetTokenPatch() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Delete('reset-password/generate/link')
  public generatePasswordResetTokenDelete() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  /**
   * reset user password using token
   * @returns {Promise<IUser>}
   * @param headers
   * @param {PasswordDTO} passwordDTO
   */
  @ApiOperation({ summary: 'Password reset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return updated user.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token is expire or Invalid Token',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No token is received',
  })
  @ApiHeader({
    name: 'authorization',
    description: 'Custom header',
  })
  @ApiBasicAuth()
  @UsePipes(new ValidationPipe(true))
  @UsePipes(new TrimPipe())
  @Patch('forget/password')
  public forgetPassword(
    @Headers() headers,
    @Body() passwordDTO: PasswordDTO,
  ): Promise<IUser> {
    try {
      const token =
        headers.hasOwnProperty('authorization') && headers['authorization']
          ? headers['authorization']
          : '';
      return this.usersService.forgetPassword(token, passwordDTO.password);
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  @ApiExcludeEndpoint()
  @Get('forget/password')
  public forgetPasswordGet() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Post('forget/password')
  public forgetPasswordPost() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Put('forget/password')
  public forgetPasswordPut() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @ApiExcludeEndpoint()
  @Delete('forget/password')
  public forgetPasswordDelete() {
    throw new MethodNotAllowedException('Method not allowed');
  }
}
