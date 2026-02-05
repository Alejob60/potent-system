"use strict";
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionSchema = exports.Interaction = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var Interaction = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _tenantId_decorators;
    var _tenantId_initializers = [];
    var _tenantId_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _channel_decorators;
    var _channel_initializers = [];
    var _channel_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _embedding_decorators;
    var _embedding_initializers = [];
    var _embedding_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var Interaction = _classThis = /** @class */ (function () {
        function Interaction_1() {
            this.tenantId = __runInitializers(this, _tenantId_initializers, void 0);
            this.userId = (__runInitializers(this, _tenantId_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.channel = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _channel_initializers, void 0));
            this.content = (__runInitializers(this, _channel_extraInitializers), __runInitializers(this, _content_initializers, void 0));
            this.role = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _role_initializers, void 0));
            this.embedding = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _embedding_initializers, void 0));
            this.metadata = (__runInitializers(this, _embedding_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.createdAt = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        return Interaction_1;
    }());
    __setFunctionName(_classThis, "Interaction");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _tenantId_decorators = [(0, mongoose_1.Prop)({ required: true, index: true })];
        _userId_decorators = [(0, mongoose_1.Prop)({ required: true, index: true })];
        _channel_decorators = [(0, mongoose_1.Prop)({
                required: true,
                enum: ['web', 'whatsapp', 'telegram', 'email', 'sms', 'api']
            })];
        _content_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _role_decorators = [(0, mongoose_1.Prop)({
                required: true,
                enum: ['user', 'assistant', 'system']
            })];
        _embedding_decorators = [(0, mongoose_1.Prop)({ type: [Number], index: '2dsphere' })];
        _metadata_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _createdAt_decorators = [(0, mongoose_1.Prop)({ default: Date.now })];
        _updatedAt_decorators = [(0, mongoose_1.Prop)({ default: Date.now })];
        __esDecorate(null, null, _tenantId_decorators, { kind: "field", name: "tenantId", static: false, private: false, access: { has: function (obj) { return "tenantId" in obj; }, get: function (obj) { return obj.tenantId; }, set: function (obj, value) { obj.tenantId = value; } }, metadata: _metadata }, _tenantId_initializers, _tenantId_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _channel_decorators, { kind: "field", name: "channel", static: false, private: false, access: { has: function (obj) { return "channel" in obj; }, get: function (obj) { return obj.channel; }, set: function (obj, value) { obj.channel = value; } }, metadata: _metadata }, _channel_initializers, _channel_extraInitializers);
        __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
        __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
        __esDecorate(null, null, _embedding_decorators, { kind: "field", name: "embedding", static: false, private: false, access: { has: function (obj) { return "embedding" in obj; }, get: function (obj) { return obj.embedding; }, set: function (obj, value) { obj.embedding = value; } }, metadata: _metadata }, _embedding_initializers, _embedding_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Interaction = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Interaction = _classThis;
}();
exports.Interaction = Interaction;
exports.InteractionSchema = mongoose_1.SchemaFactory.createForClass(Interaction);
// Índices compuestos para búsqueda eficiente
exports.InteractionSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
exports.InteractionSchema.index({ tenantId: 1, userId: 1, channel: 1 });
exports.InteractionSchema.index({ embedding: '2dsphere' });
// Middleware para actualizar timestamps
exports.InteractionSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});
