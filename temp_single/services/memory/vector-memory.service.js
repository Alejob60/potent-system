"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorMemoryService = void 0;
var common_1 = require("@nestjs/common");
var VectorMemoryService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var VectorMemoryService = _classThis = /** @class */ (function () {
        function VectorMemoryService_1(interactionModel, azureClient) {
            this.interactionModel = interactionModel;
            this.azureClient = azureClient;
            this.logger = new common_1.Logger(VectorMemoryService.name);
            this.EMBEDDING_DIMENSION = 1536; // Para text-embedding-ada-002
        }
        /**
         * Guarda una interacción generando su embedding vectorial
         * SEGURIDAD: Valida que tenantId y userId sean válidos
         */
        VectorMemoryService_1.prototype.saveInteraction = function (tenantId, userId, channel, content, role, metadata) {
            return __awaiter(this, void 0, void 0, function () {
                var embedding, interaction, savedInteraction, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Validación de seguridad
                            if (!tenantId || !userId) {
                                throw new Error('tenantId y userId son requeridos');
                            }
                            if (tenantId.length < 5 || userId.length < 5) {
                                throw new Error('IDs inválidos');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, this.generateEmbedding(content)];
                        case 2:
                            embedding = _a.sent();
                            interaction = new this.interactionModel({
                                tenantId: tenantId,
                                userId: userId,
                                channel: channel,
                                content: content,
                                role: role,
                                embedding: embedding,
                                metadata: __assign(__assign({}, metadata), { timestamp: new Date(), security: {
                                        tenantVerified: true,
                                        userVerified: true
                                    } })
                            });
                            return [4 /*yield*/, interaction.save()];
                        case 3:
                            savedInteraction = _a.sent();
                            this.logger.log("Interaction saved securely for user ".concat(userId, " in tenant ").concat(tenantId));
                            return [2 /*return*/, savedInteraction];
                        case 4:
                            error_1 = _a.sent();
                            this.logger.error("Failed to save interaction: ".concat(error_1.message));
                            throw error_1;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Busca contexto relevante usando búsqueda vectorial
         * SEGURIDAD: Asegura aislamiento entre tenants
         */
        VectorMemoryService_1.prototype.findRelevantContext = function (tenantId_1, userId_1, query_1) {
            return __awaiter(this, arguments, void 0, function (tenantId, userId, query, limit, channel) {
                var queryEmbedding, filter, relevantInteractions, error_2;
                if (limit === void 0) { limit = 5; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Validación de seguridad crítica
                            if (!tenantId || !userId) {
                                throw new Error('tenantId y userId son requeridos para búsqueda segura');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, this.generateEmbedding(query)];
                        case 2:
                            queryEmbedding = _a.sent();
                            filter = {
                                tenantId: tenantId, // Nunca tomar del body del request
                                userId: userId // Siempre del token decodificado
                            };
                            // Filtrar por canal si se especifica
                            if (channel) {
                                filter.channel = channel;
                            }
                            return [4 /*yield*/, this.performSecureVectorSearch(filter, queryEmbedding, limit)];
                        case 3:
                            relevantInteractions = _a.sent();
                            this.logger.log("Found ".concat(relevantInteractions.length, " relevant interactions for user ").concat(userId, " in tenant ").concat(tenantId));
                            return [2 /*return*/, relevantInteractions];
                        case 4:
                            error_2 = _a.sent();
                            this.logger.error("Failed to find relevant context: ".concat(error_2.message));
                            throw error_2;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Obtiene historial reciente de interacciones
         */
        VectorMemoryService_1.prototype.getRecentInteractions = function (tenantId_1, userId_1) {
            return __awaiter(this, arguments, void 0, function (tenantId, userId, limit, channel) {
                var filter;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    filter = {
                        tenantId: tenantId,
                        userId: userId
                    };
                    if (channel) {
                        filter.channel = channel;
                    }
                    return [2 /*return*/, this.interactionModel
                            .find(filter)
                            .sort({ createdAt: -1 })
                            .limit(limit)
                            .lean()];
                });
            });
        };
        /**
         * Genera embeddings usando Azure OpenAI
         */
        VectorMemoryService_1.prototype.generateEmbedding = function (text) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.azureClient.embeddings.create({
                                    input: text,
                                    model: 'text-embedding-ada-002'
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.data[0].embedding];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.warn("Failed to generate embedding, using dummy vector: ".concat(error_3.message));
                            // Vector dummy para desarrollo local
                            return [2 /*return*/, Array(this.EMBEDDING_DIMENSION).fill(0).map(function () { return Math.random(); })];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Simula búsqueda vectorial segura (para entorno local sin Atlas Vector Search)
         * SEGURIDAD: Garantiza aislamiento multi-tenant
         */
        VectorMemoryService_1.prototype.performSecureVectorSearch = function (filter, queryEmbedding, limit) {
            return __awaiter(this, void 0, void 0, function () {
                var interactions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Validar que el filtro incluye tenantId y userId
                            if (!filter.tenantId || !filter.userId) {
                                throw new Error('Filtro de seguridad incompleto');
                            }
                            return [4 /*yield*/, this.interactionModel
                                    .find(__assign({ tenantId: filter.tenantId, userId: filter.userId }, (filter.channel && { channel: filter.channel })))
                                    .sort({ createdAt: -1 })
                                    .limit(limit * 2) // Traer más para simular ranking
                                    .lean()];
                        case 1:
                            interactions = _a.sent();
                            // Simular scoring por relevancia de contenido
                            return [2 /*return*/, interactions
                                    .map(function (interaction) {
                                    var _a;
                                    return (__assign(__assign({}, interaction), { similarityScore: _this.calculateSimilarity(interaction.content.toLowerCase(), ((_a = filter.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ''), security: {
                                            tenantIsolated: true,
                                            userIsolated: true
                                        } }));
                                })
                                    .sort(function (a, b) { return b.similarityScore - a.similarityScore; })
                                    .slice(0, limit)];
                    }
                });
            });
        };
        /**
         * Calcula similitud básica entre contenidos (para simulación)
         */
        VectorMemoryService_1.prototype.calculateSimilarity = function (text1, text2) {
            if (!text1 || !text2)
                return 0;
            var words1 = new Set(text1.split(/\s+/));
            var words2 = new Set(text2.split(/\s+/));
            var intersection = new Set(__spreadArray([], words1, true).filter(function (x) { return words2.has(x); }));
            var union = new Set(__spreadArray(__spreadArray([], words1, true), words2, true));
            return intersection.size / union.size;
        };
        /**
         * Elimina interacciones antiguas para mantenimiento
         */
        VectorMemoryService_1.prototype.cleanupOldInteractions = function (tenantId_1, userId_1) {
            return __awaiter(this, arguments, void 0, function (tenantId, userId, daysToKeep) {
                var cutoffDate, result;
                if (daysToKeep === void 0) { daysToKeep = 30; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cutoffDate = new Date();
                            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
                            return [4 /*yield*/, this.interactionModel.deleteMany({
                                    tenantId: tenantId,
                                    userId: userId,
                                    createdAt: { $lt: cutoffDate }
                                })];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Cleaned up ".concat(result.deletedCount, " old interactions"));
                            return [2 /*return*/, result.deletedCount];
                    }
                });
            });
        };
        return VectorMemoryService_1;
    }());
    __setFunctionName(_classThis, "VectorMemoryService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VectorMemoryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VectorMemoryService = _classThis;
}();
exports.VectorMemoryService = VectorMemoryService;
