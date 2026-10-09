import type { FastifyReply, FastifyRequest } from "fastify";
import twilio from "twilio";

export type TwilioParams = Record<string, string | undefined>;

export const twilioParams = (req: FastifyRequest): TwilioParams => (req.body && typeof req.body === "object" ? (req.body as TwilioParams) : {});

export const VoiceResponse = twilio.twiml.VoiceResponse;
export const MessagingResponse = twilio.twiml.MessagingResponse;

export function sendTwiml(reply: FastifyReply, xml: { toString(): string }) {
  return reply.type("text/xml; charset=utf-8").send(xml.toString());
}

/** French first, then English (Charter of the French language). */
export function sayBilingual(vr: InstanceType<typeof VoiceResponse>, fr: string, en: string) {
  vr.say({ language: "fr-CA" }, fr);
  vr.say({ language: "en-CA" }, en);
}

export const NOT_IN_SERVICE = {
  fr: "Ce numéro n'est plus en service.",
  en: "This number is no longer in service.",
};
