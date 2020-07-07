import * as SparkPost from 'sparkpost';

const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = (recipientEmail: string, url: string) =>
  client.transmissions.send({
    options: {
      sandbox: true,
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Please Confirm your email',
      html: `
        <html>
          <body>
            <p>Please click the link to confirm your email!</p>
            <a href="${url}" target="_blank">Confirm Email</a>
          </body>
        </html>
      `,
    },
    recipients: [{ address: recipientEmail }],
  });
