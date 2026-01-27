import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from '@react-email/components'

interface ResetEmailProps {
  email: string
  url: string
}

const ResetPass = ({ email, url }: ResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Tailwind>
      <Body className='m-auto bg-white px-2 font-sans'>
        <Container className='mx-auto my-10 max-w-116.25 rounded-sm border border-solid border-[#eaeaea] p-5'>
          <Heading className='mx-0 my-7.5 p-0 text-center text-[24px] font-normal text-black'>Reset your password</Heading>
          <Text className='text-[14px]/6 text-black'>Hello {email},</Text>
          <Text className='text-[14px]/6 text-black'>
            We received a request to reset your password for your account. If you did not make this request, you can safely
            ignore this email.
          </Text>
          <Section className='my-8 text-center'>
            <Button
              className='rounded-sm bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline'
              href={url}>
              Reset Password
            </Button>
          </Section>
          <Text className='text-[14px]/6 text-black'>
            Or copy and paste this URL into your browser:{' '}
            <Link className='text-blue-600 no-underline' href={url}>
              {url}
            </Link>
          </Text>
          <Hr className='mx-0 my-6.5 w-full border border-solid border-[#eaeaea]' />
          <Text className='text-[12px]/6 text-[#666666]'>
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)

export default ResetPass
