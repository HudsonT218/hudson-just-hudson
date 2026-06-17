import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Hudson Turansky'

const EFFORT_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  needs_building: 'Needs building',
}
const EFFORT_COLOR: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  needs_building: '#3b82f6',
}

interface Idea {
  title?: string
  description?: string
  how_it_helps?: string
  effort?: string
}

interface AiTestResultsProps {
  greetingName?: string
  summary?: string
  at_work?: Idea[]
  in_your_life?: Idea[]
}

const IdeaCard = ({ idea }: { idea: Idea }) => {
  const effort = idea.effort ?? 'medium'
  const color = EFFORT_COLOR[effort] ?? '#6b7280'
  const label = EFFORT_LABEL[effort] ?? effort
  return (
    <Section style={{ padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
      <span style={{
        display: 'inline-block', padding: '2px 8px', fontSize: '11px',
        fontWeight: 600, letterSpacing: '0.05em', borderRadius: '999px',
        color, border: `1px solid ${color}`,
      }}>{label}</span>
      <Text style={{ margin: '8px 0 6px', fontSize: '16px', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
        {idea.title}
      </Text>
      <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#4b5563', lineHeight: 1.55 }}>
        {idea.description}
      </Text>
      <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.55 }}>
        <strong style={{ color: '#4b5563' }}>How this helps you:</strong> {idea.how_it_helps}
      </Text>
    </Section>
  )
}

const AiTestResultsEmail = ({
  greetingName = 'there',
  summary,
  at_work = [],
  in_your_life = [],
}: AiTestResultsProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your personalized AI use-case map from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>YOUR RESULTS</Text>
        <Heading style={h1}>
          Hey {greetingName}, here's your personalized AI use-case map.
        </Heading>
        {summary && <Text style={text}>{summary}</Text>}

        {at_work.length > 0 && (
          <>
            <Heading as="h2" style={h2}>AT WORK</Heading>
            {at_work.map((idea, i) => <IdeaCard key={`w-${i}`} idea={idea} />)}
          </>
        )}

        {in_your_life.length > 0 && (
          <>
            <Heading as="h2" style={h2}>IN YOUR LIFE</Heading>
            {in_your_life.map((idea, i) => <IdeaCard key={`l-${i}`} idea={idea} />)}
          </>
        )}

        <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0 16px' }} />
        <Text style={footer}>
          Reply to this email if you want to talk anything through. I read everything.
        </Text>
        <Text style={footerSmall}>Hudson</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AiTestResultsEmail,
  subject: 'Your AI Use-Case Test results',
  displayName: 'AI Test Results',
  previewData: {
    greetingName: 'Jane',
    summary: 'You have strong opportunities to apply AI in customer ops and content workflows.',
    at_work: [
      { title: 'Automated meeting notes', description: 'AI captures and summarizes calls.', how_it_helps: 'Saves 3+ hours per week.', effort: 'easy' },
      { title: 'Custom client intake agent', description: 'AI screens leads before they hit your inbox.', how_it_helps: 'Higher-quality conversations.', effort: 'needs_building' },
    ],
    in_your_life: [
      { title: 'Weekly inbox triage', description: 'AI sorts and drafts replies.', how_it_helps: 'Reclaim Monday mornings.', effort: 'medium' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }
const container = { padding: '32px 25px', maxWidth: '600px' }
const kicker = { margin: '0 0 8px', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#3b82f6', fontWeight: 500 }
const h1 = { margin: '0 0 16px', fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.02em' }
const h2 = { margin: '32px 0 4px', fontSize: '13px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#6b7280', fontWeight: 600 }
const text = { margin: '0 0 24px', fontSize: '15px', color: '#4b5563', lineHeight: 1.6 }
const footer = { margin: '0', fontSize: '12px', color: '#9ca3af', lineHeight: 1.55, textAlign: 'center' as const }
const footerSmall = { margin: '8px 0 0', fontSize: '11px', color: '#d1d5db', lineHeight: 1.55, textAlign: 'center' as const }
