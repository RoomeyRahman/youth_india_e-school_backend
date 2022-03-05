export interface IUser {
  readonly _id: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly otp: number;
  readonly otpExpiresAt: number;
  readonly emailProofToken: string;
  readonly emailProofTokenExpiresAt: number;
  readonly passwordResetToken: string;
  readonly passwordResetTokenExpiresAt: number;
  readonly isActive: boolean;
  readonly isAdmin: boolean;
  readonly isDeleted: boolean;
  readonly cTime: number;
  readonly cBy: string;
  readonly uTime: number;
  readonly uBy: string;
}
