import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built on{" "}
            <a
              href="https://lisk.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Lisk Blockchain
            </a>
            . The source code is available on{" "}
            <a
              href="https://github.com/Goodnessmbakara/auction-app"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            . Built by{" "}
            <Link
              href="https://twitter.com/GoodnesMbakara"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-500 underline hover:text-blue-600"
            >
              Goodness Mbakara
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <Link href="https://twitter.com" target="_blank" rel="noreferrer">
            <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <Link href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
