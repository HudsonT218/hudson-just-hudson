import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hudson Turansky'

interface FreeBuildSignupProps {
  name?: string
  email?: string
  company?: string | null
  phone?: string | null
  message?: string | null
  utmSource?: string | null
}

const Row = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null
  return (
    <Section style={{ padding: '8px 0', borderTop: '1px solid #e5e7eb' }}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  )
}

const FreeBuildSignupEmail = ({
  name = 'Someone',
  email,
  company,
  phone,
  message,
  utmSource,
}: FreeBuildSignupProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New free-project signup from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>NEW SIGNUP</Text>
        <Heading style={h1}>{name} claimed a free spot.</Heading>
        <Text style={text}>
          Someone just submitted the /free-build form. They're already in
          Admin → Leads as a Warm lead — open it to schedule the discovery call.
        </Text>

        <Section style={card}>
          <Row label="Name" value={name} />
          <Row label="Email" value={email} />
          <Row label="Company" value={company ?? undefined} />
          <Row label="Phone" value={phone ?? undefined} />
          <Row label="What they want built" value={message ?? undefined} />
          <Row label="UTM source" value={utmSource ?? undefined} />
        </Section>

        <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0 16px' }} />
        <Text style={footer}>{SITE_NAME} · /free-build</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeBuildSignupEmail,
  subject: (data: Record<string, any>) =>
    `New free-project signup: ${data?.name ?? 'someone'}`,
  to: Deno.env.get('ADMIN_EMAIL') ?? 'hudsonturansky@gmail.com',
  displayName: 'Free-build signup notification',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    company: 'Acme Co',
    phone: '+1 555 123 4567',
    message: 'Want help automating our intake forms with AI.',
    utmSource: 'twitter',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { padding: '32px 25px', maxWidth: '600px' }
const kicker = { margin: '0 0 8px', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#3b82f6', fontWeight: 500 }
const h1 = { margin: '0 0 16px', fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.02em' }
const text = { margin: '0 0 24px', fontSize: '15px', color: '#4b5563', lineHeight: 1.6 }
const card = { padding: '4px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }
const rowLabel = { margin: '0', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#6b7280', fontWeight: 600 }
const rowValue = { margin: '2px 0 0', fontSize: '14px', color: '#111827', lineHeight: 1.55, whiteSpace: 'pre-wrap' as const }
const footer = { margin: '0', fontSize: '12px', color: '#9ca3af', lineHeight: 1.55, textAlign: 'center' as const }
