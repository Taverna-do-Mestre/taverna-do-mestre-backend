export interface ErrorDetails {
    attribute: string;
    path: string;
    reason: string;
}

export interface Errors {
    message: string;
    code: number;
    name?: string;
    details?: ErrorDetails[];
}

export type ErrorTypes =
    | 'blank-question-or-answer'
    | 'email-already-exist'
    | 'tag-already-exist'
    | 'user-inexistent'
    | '2fa-no-active'
    | '2fa-already-active'
    | '2fa-incorrect'
    | 'rpg-not-found-id'
    | 'query-string-incorrect'
    | 'query-missing'
    | 'login'
    | 'linked-data'
    | 'verification-email'
    | 'invalid-user-status'
    | 'invalid-email-verify-code'
    | 'linked-mandatory-data-when-delete'
    | 'verification-email-send-fail'
    | 'invalid-user-status'
    | 'unauthorized';
