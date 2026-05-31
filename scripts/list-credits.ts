import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

const envPaths = [path.resolve(__dirname, '../apps/api/.env'), path.resolve(__dirname, '../.env')]
for (const p of envPaths) { if (fs.existsSync(p)) { dotenv.config({ path: p }); break } }

const prisma = new PrismaClient()

async function main() {
  const accounts = await prisma.creditAccount.findMany({
    where: { balance: { gt: 0 } },
    include: { user: { select: { email: true, name: true, createdAt: true } } },
    orderBy: { balance: 'desc' },
  })

  if (accounts.length === 0) {
    console.log('No hay cuentas con créditos.')
    return
  }

  console.log(`\n💳 Cuentas con créditos (${accounts.length} total)\n`)
  accounts.forEach((a, i) => {
    console.log(`[${i + 1}] ${a.user.email}`)
    console.log(`     Nombre:   ${a.user.name ?? '(sin nombre)'}`)
    console.log(`     Balance:  ${a.balance} créditos`)
    console.log(`     Lifetime: ${a.lifetimeCredits} créditos`)
    console.log(`     Registro: ${a.user.createdAt.toISOString().split('T')[0]}`)
  })
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect())
