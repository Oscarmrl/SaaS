/**
 * Script de desarrollo — agrega créditos a una cuenta por email
 *
 * Flujo:
 *  1. Busca el usuario en Supabase Auth (por email)
 *  2. Si existe en Supabase, crea o busca el registro en nuestra DB
 *  3. Crea o busca el CreditAccount
 *  4. Agrega los créditos en una transacción atómica
 *
 * Uso:
 *   npx tsx scripts/add-dev-credits.ts
 *
 * Variables de entorno requeridas (en .env del raíz o apps/api/.env):
 *   DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// ─── Cargar .env ──────────────────────────────────────────────────────────────
const envPaths = [
  path.resolve(__dirname, '../apps/api/.env'),
  path.resolve(__dirname, '../.env'),
]
for (const p of envPaths) {
  if (fs.existsSync(p)) { dotenv.config({ path: p }); break }
}

// ─── Config ───────────────────────────────────────────────────────────────────
const EMAIL  = 'omurillooseguera@gmail.com'
const AMOUNT = 5000
const REASON = 'TESTING — créditos para pruebas'

// ─── Clients ──────────────────────────────────────────────────────────────────
const prisma = new PrismaClient()

const supabaseUrl      = process.env['SUPABASE_URL']
const supabaseKey      = process.env['SUPABASE_SERVICE_ROLE_KEY']

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Buscando usuario: ${EMAIL}\n`)

  // ── 1. Intentar encontrar el usuario en nuestra DB primero ──────────────────
  let user = await prisma.user.findUnique({ where: { email: EMAIL } })

  if (user) {
    console.log(`✅ Usuario encontrado en DB local — ID: ${user.id}`)
  } else {
    console.log('⚠️  Usuario no encontrado en DB local.')

    // ── 2. Buscar en Supabase Auth si tenemos las credenciales ──────────────
    if (supabaseUrl && supabaseKey) {
      console.log('🔍 Buscando en Supabase Auth...')
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      if (listError) {
        console.error('❌ Error al listar usuarios de Supabase:', listError.message)
      } else {
        const sbUser = listData.users.find(u => u.email === EMAIL)
        if (sbUser) {
          console.log(`✅ Usuario encontrado en Supabase Auth — ID: ${sbUser.id}`)
          console.log('📝 Creando registro en DB local...')
          user = await prisma.user.create({
            data: {
              supabaseId: sbUser.id,
              email:      EMAIL,
              name:       sbUser.user_metadata?.['full_name'] as string ?? EMAIL.split('@')[0]!,
            },
          })
          console.log(`✅ Usuario creado en DB — ID: ${user.id}`)
        } else {
          console.log(`⚠️  Usuario no encontrado en Supabase Auth (aún no se ha registrado).`)
          console.log('📝 Creando usuario temporal para testing...')
          user = await prisma.user.create({
            data: {
              supabaseId: `dev-${DATE_PLACEHOLDER}-${EMAIL.replace(/[@.]/g, '-')}`,
              email:      EMAIL,
              name:       EMAIL.split('@')[0]!,
            },
          })
          console.log(`✅ Usuario temporal creado — ID: ${user.id}`)
          console.log('   ⚠️  Cuando el usuario se registre, el supabaseId se actualizará automáticamente.')
        }
      }
    } else {
      // Sin Supabase credentials, crear usuario de testing directo
      console.log('⚠️  Sin SUPABASE_URL/KEY — creando usuario de testing directo...')
      user = await prisma.user.create({
        data: {
          supabaseId: `dev-testing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          email:      EMAIL,
          name:       EMAIL.split('@')[0]!,
        },
      })
      console.log(`✅ Usuario creado — ID: ${user.id}`)
    }
  }

  if (!user) {
    console.error('❌ No se pudo obtener o crear el usuario')
    process.exit(1)
  }

  // ── 3. Buscar o crear CreditAccount ─────────────────────────────────────────
  let account = await prisma.creditAccount.findUnique({ where: { userId: user.id } })
  if (!account) {
    account = await prisma.creditAccount.create({
      data: { userId: user.id, balance: 0, lifetimeCredits: 0 },
    })
    console.log('📁 CreditAccount creada')
  }

  console.log(`\n💳 Balance actual: ${account.balance} créditos`)

  // ── 4. Transacción atómica: actualizar balance + registrar transacción ───────
  const [updatedAccount, tx] = await prisma.$transaction([
    prisma.creditAccount.update({
      where: { userId: user.id },
      data: {
        balance:         { increment: AMOUNT },
        lifetimeCredits: { increment: AMOUNT },
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId:      user.id,
        amount:      AMOUNT,
        type:        'BONUS',
        description: REASON,
      },
    }),
  ])

  console.log(`\n✅ ¡Créditos agregados exitosamente!`)
  console.log(`   Usuario:        ${user.email}`)
  console.log(`   ID:             ${user.id}`)
  console.log(`   Agregado:       +${AMOUNT} créditos`)
  console.log(`   Balance nuevo:  ${updatedAccount.balance} créditos`)
  console.log(`   Lifetime total: ${updatedAccount.lifetimeCredits} créditos`)
  console.log(`   Transacción ID: ${tx.id}`)
}

// Placeholder corregido
const DATE_PLACEHOLDER = new Date().toISOString().split('T')[0]!.replace(/-/g, '')

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
