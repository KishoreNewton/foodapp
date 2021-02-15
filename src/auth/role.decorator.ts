import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/users.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: string[]): any => SetMetadata('roles', roles);
