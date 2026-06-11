import { AppRole } from '../../common/enums/app-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
  userType: 'staff' | 'client';
}
