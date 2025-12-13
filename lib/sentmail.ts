import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST!;
const port = parseInt(process.env.EMAIL_PORT!);
const user = process.env.EMAIL_USER!;
const pass = process.env.EMAIL_PASS!;

let transporter = nodemailer.createTransport({
	host,
	port,
	secure: port === 465, //! true for 465, false for other ports
	auth: {
		user,
		pass,
	},
});

export const sendMail = async ({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) => {
	try {
		//? Send email
		const { accepted } = await transporter.sendMail({
			from: `"2FA Authenticator" <${user}>`,
			to,
			subject,
			html,
		});

		return accepted.length > 0;
	} catch {
		return false;
	}
};
