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
        while (_) try {
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
exports.__esModule = true;
exports.openAIService = exports.OpenAIService = void 0;
var openai_1 = require("openai");
var ErrorTypes_1 = require("../errors/ErrorTypes");
var CHATBOT_INSTRUCTIONS = "Voce e um chatbot util e objetivo. Responda em portugues quando o usuario escrever em portugues.";
var CONVERSATION_TITLE_INSTRUCTIONS = "Voce cria titulos curtos para conversas. Responda somente com um titulo em portugues, sem aspas, com no maximo 8 palavras.";
var OpenAIService = /** @class */ (function () {
    function OpenAIService() {
        this.client = null;
    }
    OpenAIService.prototype.getClient = function () {
        if (this.client) {
            return this.client;
        }
        var apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw ErrorTypes_1.ErrorTypes.Environment("OPENAI_API_KEY nao configurada na API.");
        }
        this.client = new openai_1["default"]({ apiKey: apiKey });
        return this.client;
    };
    OpenAIService.prototype.createResponse = function (params) {
        return __awaiter(this, void 0, Promise, function () {
            var client;
            return __generator(this, function (_a) {
                client = this.getClient();
                return [2 /*return*/, client.responses.create(params)];
            });
        });
    };
    OpenAIService.prototype.createChatbotAssistantResponse = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var baseParams;
            return __generator(this, function (_a) {
                baseParams = {
                    model: this.getModel(),
                    instructions: CHATBOT_INSTRUCTIONS,
                    input: input
                };
                return [2 /*return*/, this.createResponse(__assign(__assign({}, baseParams), { stream: true }))];
            });
        });
    };
    OpenAIService.prototype.createConversationTitleResponse = function (prompt) {
        return __awaiter(this, void 0, Promise, function () {
            var compactPrompt;
            return __generator(this, function (_a) {
                compactPrompt = prompt.trim().replace(/\s+/g, " ");
                return [2 /*return*/, this.createResponse({
                        model: this.getModel(),
                        instructions: CONVERSATION_TITLE_INSTRUCTIONS,
                        input: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "input_text",
                                        text: "Gere um titulo para esta conversa: " + compactPrompt
                                    },
                                ]
                            },
                        ],
                        temperature: 0.2,
                        max_output_tokens: 24,
                        stream: false
                    })];
            });
        });
    };
    OpenAIService.prototype.extractOutputText = function (response) {
        var directOutputText = typeof response.output_text === "string" ? response.output_text.trim() : "";
        if (directOutputText)
            return directOutputText;
        var output = Array.isArray(response.output) ? response.output : [];
        for (var _i = 0, output_1 = output; _i < output_1.length; _i++) {
            var item = output_1[_i];
            if (!item || typeof item !== "object")
                continue;
            var typedItem = item;
            if (typedItem.type !== "message" || !Array.isArray(typedItem.content))
                continue;
            var text = typedItem.content
                .map(function (part) {
                var _a;
                if (!part || typeof part !== "object")
                    return "";
                var typedPart = part;
                if (typedPart.type !== "output_text")
                    return "";
                return String((_a = typedPart.text) !== null && _a !== void 0 ? _a : "").trim();
            })
                .filter(Boolean)
                .join("\n")
                .trim();
            if (text)
                return text;
        }
        return "";
    };
    OpenAIService.prototype.getModel = function () {
        return process.env.OPENAI_MODEL || "gpt-4.1-mini";
    };
    return OpenAIService;
}());
exports.OpenAIService = OpenAIService;
exports.openAIService = new OpenAIService();
