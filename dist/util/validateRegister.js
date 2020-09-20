"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'Username must be 3 characters or longer',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Cannot include @',
            },
        ];
    }
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'Invalid email',
            },
        ];
    }
    if (options.password.length <= 2) {
        return [
            {
                field: 'password',
                message: 'Password must be 3 characters or longer',
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map