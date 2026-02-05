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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretaryService = void 0;
var common_1 = require("@nestjs/common");
var SecretaryService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SecretaryService = _classThis = /** @class */ (function () {
        function SecretaryService_1(vectorMemoryService, 
        // private readonly videoService: VideoService,
        // private readonly websiteAnalysisService: WebsiteAnalysisService,
        // private readonly viralPipelineService: ViralPipelineService,
        azureClient) {
            this.vectorMemoryService = vectorMemoryService;
            this.azureClient = azureClient;
            this.logger = new common_1.Logger(SecretaryService.name);
        }
        /**
         * Método maestro: procesa la solicitud del usuario
         */
        SecretaryService_1.prototype.processUserRequest = function (userId, tenantId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var context, intent, response, _a, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 14, , 15]);
                            this.logger.log("Processing request from user ".concat(userId, " in tenant ").concat(tenantId));
                            return [4 /*yield*/, this.vectorMemoryService.findRelevantContext(tenantId, userId, input.text, 5, input.channel)];
                        case 1:
                            context = _b.sent();
                            return [4 /*yield*/, this.analyzeIntent(input.text, context)];
                        case 2:
                            intent = _b.sent();
                            // 3. Guardar la interacción en memoria vectorial
                            return [4 /*yield*/, this.vectorMemoryService.saveInteraction(tenantId, userId, input.channel, input.text, 'user', __assign({ sessionId: input.sessionId, intent: intent.type }, input.metadata))];
                        case 3:
                            // 3. Guardar la interacción en memoria vectorial
                            _b.sent();
                            response = void 0;
                            _a = intent.type;
                            switch (_a) {
                                case 'INIT_TOOL': return [3 /*break*/, 4];
                                case 'EXECUTE_TASK': return [3 /*break*/, 6];
                                case 'CHAT': return [3 /*break*/, 8];
                            }
                            return [3 /*break*/, 10];
                        case 4: return [4 /*yield*/, this.handleInitTool(intent.tool || '', input)];
                        case 5:
                            response = _b.sent();
                            return [3 /*break*/, 12];
                        case 6: return [4 /*yield*/, this.handleExecuteTask(intent.task || '', input, context)];
                        case 7:
                            response = _b.sent();
                            return [3 /*break*/, 12];
                        case 8: return [4 /*yield*/, this.handleChat(input.text, context)];
                        case 9:
                            response = _b.sent();
                            return [3 /*break*/, 12];
                        case 10: return [4 /*yield*/, this.handleChat(input.text, context)];
                        case 11:
                            response = _b.sent();
                            _b.label = 12;
                        case 12: 
                        // 5. Guardar respuesta del sistema
                        return [4 /*yield*/, this.vectorMemoryService.saveInteraction(tenantId, userId, input.channel, response.content || '', 'assistant', {
                                sessionId: input.sessionId,
                                action: response.action,
                                tool: response.tool,
                                jobId: response.jobId
                            })];
                        case 13:
                            // 5. Guardar respuesta del sistema
                            _b.sent();
                            return [2 /*return*/, response];
                        case 14:
                            error_1 = _b.sent();
                            this.logger.error("Error processing user request: ".concat(error_1.message));
                            return [2 /*return*/, {
                                    action: 'CHAT',
                                    content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.'
                                }];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Analiza la intención del usuario usando Azure OpenAI
         */
        SecretaryService_1.prototype.analyzeIntent = function (text, context) {
            return __awaiter(this, void 0, void 0, function () {
                var contextSummary, prompt_1, completion, response, error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            contextSummary = context.map(function (c) { return c.content; }).join('\n');
                            prompt_1 = "\n      Analiza la siguiente solicitud del usuario y determina la intenci\u00F3n:\n      \n      Texto del usuario: \"".concat(text, "\"\n      \n      Contexto reciente:\n      ").concat(contextSummary, "\n      \n      Determina una de estas acciones:\n      - INIT_TOOL: Si el usuario quiere iniciar una herramienta (video, an\u00E1lisis web, etc.)\n      - EXECUTE_TASK: Si el usuario quiere ejecutar una tarea espec\u00EDfica\n      - CHAT: Si es una conversaci\u00F3n general\n      \n      Responde SOLO con un JSON en este formato:\n      {\n        \"type\": \"INIT_TOOL|EXECUTE_TASK|CHAT\",\n        \"tool\": \"nombre_de_la_herramienta_si_aplica\",\n        \"task\": \"descripcion_de_la_tarea_si_aplica\"\n      }\n      ");
                            return [4 /*yield*/, this.azureClient.chat.create({
                                    model: 'gpt-4',
                                    messages: [{ role: 'user', content: prompt_1 }],
                                    temperature: 0.3,
                                    max_tokens: 200
                                })];
                        case 1:
                            completion = _c.sent();
                            response = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                            if (response) {
                                try {
                                    return [2 /*return*/, JSON.parse(response)];
                                }
                                catch (parseError) {
                                    this.logger.warn('Failed to parse LLM response, using default');
                                }
                            }
                            // Fallback por seguridad
                            return [2 /*return*/, { type: 'CHAT' }];
                        case 2:
                            error_2 = _c.sent();
                            this.logger.error("Intent analysis failed: ".concat(error_2.message));
                            return [2 /*return*/, { type: 'CHAT' }]; // Fallback seguro
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Maneja la inicialización de herramientas
         */
        SecretaryService_1.prototype.handleInitTool = function (tool, input) {
            return __awaiter(this, void 0, void 0, function () {
                var toolMap, normalizedTool;
                return __generator(this, function (_a) {
                    toolMap = {
                        'video': 'VIDEO',
                        'vídeo': 'VIDEO',
                        'crear video': 'VIDEO',
                        'generar video': 'VIDEO',
                        'website': 'WEBSITE_ANALYSIS',
                        'sitio web': 'WEBSITE_ANALYSIS',
                        'analizar web': 'WEBSITE_ANALYSIS',
                        'viral': 'VIRAL_PIPELINE',
                        'contenido viral': 'VIRAL_PIPELINE'
                    };
                    normalizedTool = toolMap[tool === null || tool === void 0 ? void 0 : tool.toLowerCase()] || 'VIDEO';
                    return [2 /*return*/, {
                            action: 'UI_RENDER_NODE',
                            tool: normalizedTool,
                            content: "Inicializando herramienta ".concat(normalizedTool),
                            data: {
                                type: normalizedTool,
                                status: 'initializing',
                                userInput: input.text
                            }
                        }];
                });
            });
        };
        /**
         * Maneja la ejecución de tareas
         */
        SecretaryService_1.prototype.handleExecuteTask = function (task, input, context) {
            return __awaiter(this, void 0, void 0, function () {
                var jobId;
                return __generator(this, function (_a) {
                    // Aquí iría la lógica para ejecutar tareas específicas
                    // Por ahora simulamos con placeholders
                    if (task === null || task === void 0 ? void 0 : task.includes('video')) {
                        jobId = "video_".concat(Date.now());
                        return [2 /*return*/, {
                                action: 'EXECUTE_TASK',
                                tool: 'VIDEO',
                                jobId: jobId,
                                content: 'Iniciando generación de video...',
                                data: {
                                    jobId: jobId,
                                    status: 'processing',
                                    estimatedTime: '2-3 minutos'
                                }
                            }];
                    }
                    return [2 /*return*/, {
                            action: 'CHAT',
                            content: 'Tarea ejecutada correctamente'
                        }];
                });
            });
        };
        /**
         * Maneja conversaciones generales
         */
        SecretaryService_1.prototype.handleChat = function (text, context) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Aquí iría la lógica de chat con contexto
                    return [2 /*return*/, {
                            action: 'CHAT',
                            content: "Entendido: \"".concat(text, "\". \u00BFEn qu\u00E9 m\u00E1s puedo ayudarte?")
                        }];
                });
            });
        };
        return SecretaryService_1;
    }());
    __setFunctionName(_classThis, "SecretaryService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SecretaryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SecretaryService = _classThis;
}();
exports.SecretaryService = SecretaryService;
