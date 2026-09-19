import { Link } from 'react-router-dom'

export function Footer() {
  return <footer className="mt-20 border-t border-slate-800 bg-[#070a0e]">
    <div className="shell flex flex-col gap-3 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="font-bold text-slate-200">oceky<span className="text-ice">WT</span></p>
      <p className="text-slate-500">Витрина аккаунтов War Thunder · Покупка оформляется на FunPay.</p>
      <Link to="/catalog" className="text-slate-400 hover:text-ice">Каталог</Link>
    </div>
  </footer>
}
