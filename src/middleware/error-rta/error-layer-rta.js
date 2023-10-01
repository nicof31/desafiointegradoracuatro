import { StatusCodes } from "http-status-codes";

export const EnumErrors = {
    ROUTING_ERROR: `ROUTING ERROR`, //error
    INVALID_TYPES_ERROR: `INVALID TYPES ERROR`, //error
    CONTROLLER_ERROR: `CONTROLLER ERROR`,   //error
    DATABASE_ERROR: `DB ERROR`, //error
    INVALID_PARAMS: `INVALID PARAMS ERROR`, //error
    UNAUTHORIZED_ERROR:`UNAUTHORIZED ERROR`, //error
    BADREQUEST_ERROR:`BADREQUEST ERROR`,    //error
    INCOMPLETE_ERROR: `INCOMPLETE VALUE ERROR`, //error
    VALIDATION_ERROR: `VALIDATION ERROR`,  //error
    FORBIDDEN_ERROR: `FORBIDDEN ERROR`, //waring
    INTERNAL_SERVER_ERROR: `INTERNAL SERVER ERROR`, //fatal
};

export const ErrorLevels = {
    [EnumErrors.ROUTING_ERROR]: "error",
    [EnumErrors.INVALID_TYPES_ERROR]: "error",
    [EnumErrors.CONTROLLER_ERROR]: "error",
    [EnumErrors.DATABASE_ERROR]: "error",
    [EnumErrors.INVALID_PARAMS]: "error",
    [EnumErrors.UNAUTHORIZED_ERROR]: "error",
    [EnumErrors.BADREQUEST_ERROR]: "error",
    [EnumErrors.INCOMPLETE_ERROR]: "error",
    [EnumErrors.VALIDATION_ERROR]: "error",
    [EnumErrors.FORBIDDEN_ERROR]: "warning",
    [EnumErrors.INTERNAL_SERVER_ERROR]: "fatal",
};

export const EnumSuccess= {
    SUCCESS: `SUCCESS`,
};


export class HttpResponse {

//-----------SATAUS SUCCESS-------------------    
    //(200)
    OK(res, message, data) {
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            statusMessage: message,
            data,
        });
    }
    
    //(201)
    Create(res, message, data) {
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            statusMessage: message,
            data,
        });
    }

    //(202)
    Accepted(res, message, data) {
        return res.status(StatusCodes.ACCEPTED).json({
            status: StatusCodes.ACCEPTED,
            statusMessage: message,
            data,
        });
    }


//--------------------SATAUS ERROR------------------------   

    //(400)
    BadRequest(res, message, data) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            statusMessage: message,
            data,
        });
    }

    //(401)
    Unauthorized(res, message, data) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusCodes.UNAUTHORIZED,
            statusMessage: message,
            data,
        });
    }

    //(403)
    Forbbiden(res, message, data) {
        return res.status(StatusCodes.FORBIDDEN).json({
            status: StatusCodes.FORBIDDEN,
            statusMessage: message,
            data,
        });
    }

    //(404)
    NotFound(res, message, data) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            statusMessage: message,
            data,
        });
    }

    //(500)
    Error(res, message, data) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            statusMessage: message,
            data,
        });
    }
}