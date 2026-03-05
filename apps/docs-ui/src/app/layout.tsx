import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import '../globals.css'

export const metadata = {
  title: {
    default: '@choblue/ui',
    template: '%s | @choblue/ui',
  },
  description: '@choblue/ui Design System Documentation',
}

const navbar = (
  <Navbar
    logo={<b>@choblue/ui</b>}
    projectLink="https://github.com/choblue/ui"
  />
)

const footer = (
  <Footer>MIT {new Date().getFullYear()} &copy; choblue.</Footer>
)

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
