"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInitiateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BusinessDataDto {
    nit;
    razonSocial;
    representanteLegal;
    emailFacturacion;
    telefonoEmpresa;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'NIT de la empresa',
        example: '123456789-0',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BusinessDataDto.prototype, "nit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razón social de la empresa',
        example: 'ColombiaTIC S.A.S.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BusinessDataDto.prototype, "razonSocial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del representante legal',
        example: 'Juan Pérez',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BusinessDataDto.prototype, "representanteLegal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email de facturación',
        example: 'facturacion@colombiatic.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BusinessDataDto.prototype, "emailFacturacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Teléfono de la empresa',
        example: '+573001234567',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BusinessDataDto.prototype, "telefonoEmpresa", void 0);
class PaymentInitiateDto {
    userId;
    productId;
    planId;
    fastSale;
    business;
}
exports.PaymentInitiateDto = PaymentInitiateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del usuario',
        example: 'user-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentInitiateDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del producto',
        example: 'landing_page',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentInitiateDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del plan (opcional)',
        example: 'basic',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentInitiateDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica si es una venta rápida',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PaymentInitiateDto.prototype, "fastSale", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Datos empresariales (requeridos para montos > COP 2.000.000)',
        type: BusinessDataDto,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BusinessDataDto),
    __metadata("design:type", BusinessDataDto)
], PaymentInitiateDto.prototype, "business", void 0);
