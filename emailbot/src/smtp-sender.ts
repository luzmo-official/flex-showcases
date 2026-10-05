import nodemailer from 'nodemailer';
import type { AppConfig, OutgoingReply } from './types.js';
import type { MailSender } from './message-handler.js';

export function createMailSender(config: AppConfig): MailSender {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });

  return async (reply: OutgoingReply) => {
    await transporter.sendMail({
      from: config.smtpFrom,
      to: reply.to,
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
      inReplyTo: reply.inReplyTo,
      references: reply.references,
      headers: {
        'Auto-Submitted': 'auto-replied',
        'X-Auto-Response-Suppress': 'All',
      },
      attachments: reply.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        cid: attachment.cid,
        contentType: attachment.contentType,
        contentDisposition: attachment.contentDisposition,
      })),
    });
  };
}
