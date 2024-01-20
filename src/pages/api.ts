import nodemailer from 'nodemailer'
import type { APIRoute } from 'astro';
import Joi from "joi"
import jwt from "jsonwebtoken"

const usuarioRegisterSchema = Joi.object({
    email: Joi.string().email().required().regex(/\uc\.cl$/),
})

const usuarioVerifycodeSchema = Joi.object({
    email: Joi.string().email().required().regex(/\uc\.cl$/),
    verifycode: Joi.number().min(10000).max(99999).required()
})

const usuarioVerifyTokenSchema = Joi.object({
    token: Joi.string().required()
})

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: import.meta.env.EMAIL,
        pass: import.meta.env.EMAIL_PASSWORD,
    },
});

const generateVerifyCode = () => {
    const codigo = Math.floor(10000 + Math.random() * 90000);
    return codigo.toString();
}

const sendEmail = async (email: string, codigo: string) => {

    const mailOptions = {
        from: import.meta.env.EMAIL,
        to: email,
        subject: 'Código de verificación',
        text: `Su código de verificación de 5 números es: ${codigo}`,
    };
    await transporter.sendMail(mailOptions)


}

const createToken = (email: string) => {

    const token = jwt.sign({ sub: email },
        import.meta.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
        });
    return token
}

const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, import.meta.env.JWT_SECRET);
        return true;
    } catch {
        console.error("Error al verificar el token");
        return false;
    }
}

const EMAIL2VERIFYCODE = new Map();


// send verify code to email
export const PATCH: APIRoute = async ({ request }) => {
    const data = await request.json()
    const { error, value } = usuarioRegisterSchema.validate(data);

    if (error) return new Response(
        JSON.stringify({
            message: error.details[0].message
        }), {
        status: 400,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );

    const codigo = generateVerifyCode();

    try {
        await sendEmail(value.email, codigo);
    } catch {
        return new Response(
            JSON.stringify({
                message: "Lamentamos informarte que hubo un problema al intentar enviar tu correo desde nuestra aplicación web. Estamos trabajando para solucionarlo lo más rápido posible. Por favor, inténtalo nuevamente más tarde."
            }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        );
    }

    EMAIL2VERIFYCODE.set(value.email, [codigo, value]);

    setTimeout(() => {
        EMAIL2VERIFYCODE.delete(value.email);
        console.log(`${new Date()} | The code of: ${value.email} has been deleted`);
    }, 1000 * 60 * 5);

    return new Response(
        JSON.stringify({
            message: "Ok"
        }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );
}
// Generate token
export const PUT: APIRoute = async ({ request, cookies }) => {
    const data = await request.json()
    const { error, value } = usuarioVerifycodeSchema.validate(data);

    if (error) return new Response(
        JSON.stringify({
            message: error.details[0].message
        }), {
        status: 400,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );

    if (!EMAIL2VERIFYCODE.has(value.email)) return new Response(
        JSON.stringify({
            message: "Su correo electrónico no cuenta con ningún código de verificación."
        }), {
        status: 404,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );


    if (value.verifycode !== (+EMAIL2VERIFYCODE.get(value.email)[0])) return new Response(
        JSON.stringify({
            message: "El código no coincide."
        }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );

    EMAIL2VERIFYCODE.delete(value.email);
    const token = createToken(value.email);


    let fechaActual = new Date();
    fechaActual.setDate(fechaActual.getDate() + 365);

    cookies.set("token", token, {
        expires: fechaActual
    })

    console.log(`${new Date()} | ${value.email} has logged in`);

    return new Response(
        JSON.stringify({
            token: token,
            message: "Ok"
        }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );
}
// verify token
export const POST: APIRoute = async ({ request }) => {
    const data = await request.json()
    const { error, value } = usuarioVerifyTokenSchema.validate(data);

    if (error) {
        return new Response(
            JSON.stringify({
                message: error.details[0].message
            }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        );
    }

    const isAuth = verifyToken(value.token)

    if (!isAuth) return new Response(
        JSON.stringify({
            message: "Not auth"
        }), {
        status: 403,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );

    return new Response(
        JSON.stringify({
            message: "Ok"
        }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );
};


// Logout
export const DELETE: APIRoute = async ({ cookies }) => {
    if (cookies.has("token")) {
        cookies.delete("token");
    }
    return new Response(
        JSON.stringify({
            message: "Ok"
        }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    );
}