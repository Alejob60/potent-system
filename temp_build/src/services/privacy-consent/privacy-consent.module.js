"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyConsentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const consent_management_service_1 = require("./consent-management.service");
const privacy_controls_service_1 = require("./privacy-controls.service");
const compliance_service_1 = require("./compliance.service");
const consent_record_entity_1 = require("../../entities/consent-record.entity");
const consent_preferences_entity_1 = require("../../entities/consent-preferences.entity");
let PrivacyConsentModule = class PrivacyConsentModule {
};
exports.PrivacyConsentModule = PrivacyConsentModule;
exports.PrivacyConsentModule = PrivacyConsentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                consent_record_entity_1.ConsentRecord,
                consent_preferences_entity_1.ConsentPreferences,
            ]),
        ],
        providers: [
            consent_management_service_1.ConsentManagementService,
            privacy_controls_service_1.PrivacyControlsService,
            compliance_service_1.ComplianceService,
        ],
        exports: [
            consent_management_service_1.ConsentManagementService,
            privacy_controls_service_1.PrivacyControlsService,
            compliance_service_1.ComplianceService,
        ],
    })
], PrivacyConsentModule);
//# sourceMappingURL=privacy-consent.module.js.map