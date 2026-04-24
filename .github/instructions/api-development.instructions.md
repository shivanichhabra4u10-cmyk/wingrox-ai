---
name: api-development
description: "Use when: building NestJS API endpoints. Include Zod validation, RBAC, audit logging, and OpenAPI documentation."
applyTo: "backend/src/modules/**"
---

# API Development Guidelines

## Endpoint Structure
1. **Controller**: Route definitions and request handling
2. **Service**: Business logic
3. **DTO**: Request/response schemas (Zod)
4. **Guard**: RBAC and auth
5. **Decorator**: Reusable logic

## Template
```typescript
// users.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const CreateUserDTO = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['user', 'admin']).default('user'),
});

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async listUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(JwtGuard)
  async createUser(@Body() dto: z.infer<typeof CreateUserDTO>) {
    const validated = CreateUserDTO.parse(dto);
    return this.usersService.create(validated);
  }
}
```

## Database Operations
- Always use Prisma ORM
- Enable transaction support for critical operations
- Log all mutations for audit trail
- Implement soft deletes where applicable

## Response Format
```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2026-04-24T10:30:00Z"
}
```

## Security
- Validate all inputs with Zod
- Check RBAC before data access
- Hash passwords (bcrypt)
- Rate limit public endpoints
- Log sensitive operations
