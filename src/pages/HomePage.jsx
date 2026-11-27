import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import HeroSearch from '../components/HeroSearch.jsx'
import PopularChips from '../components/PopularChips.jsx'
import ConditionCard from '../components/ConditionCard.jsx'
import FeatureItem from '../components/FeatureItem.jsx'
import FaqItem from '../components/FaqItem.jsx'
import Footer from '../components/Footer.jsx'
import { ArrowRight } from '../components/Icons.jsx'
import { conditions, faqs, features, footer, popularConditions } from '../data.js'

export default function HomePage() {
  const [values, setValues] = useState({ condition: '', subCondition: '', location: '' })

  return (
    <div id="top">
      <section className="navy-surface z-20 pb-24 text-white md:min-h-[560px]">
        <Navbar />
        <div className="mx-auto max-w-page px-5 pt-12 text-center sm:px-8 md:pt-20">
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight md:text-[40px]">
            Advancing Medicine. Empowering People.
          </h1>
          <p className="mt-3 text-base text-white/75">Join clinical studies that shape the future of healthcare</p>
          <div className="mt-9">
            <HeroSearch values={values} setValues={setValues} />
            <PopularChips
              items={popularConditions}
              active={values.condition}
              onSelect={(c) => setValues((s) => ({ ...s, condition: c, subCondition: s.condition === c ? s.subCondition : '' }))}
            />
          </div>
        </div>
      </section>

      <main>
        <section aria-labelledby="browse-h" className="px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 id="browse-h" className="text-2xl font-semibold tracking-tight text-ink md:text-[28px]">Browse trials by condition</h2>
            <p className="mt-2 text-muted">Find studies recruiting for the conditions that matter to you</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {conditions.map((c) => <ConditionCard key={c.title} {...c} />)}
          </div>
          <div className="mt-8 text-center">
            <a href="#" className="focus-ring-light inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-semibold uppercase tracking-wide text-ink underline underline-offset-4 hover:text-navy-800">
              View all <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="about" aria-labelledby="why-h" className="px-5 pb-24 pt-8 sm:px-8">
          <div className="text-center">
            <h2 id="why-h" className="text-2xl font-semibold tracking-tight text-ink md:text-[28px]">Why Trial Nexus</h2>
            <p className="mt-2 text-muted">A simpler, safer way to find the right study</p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-[960px] grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {features.map((f) => <FeatureItem key={f.title} {...f} />)}
          </ul>
        </section>

        <section id="faq" aria-labelledby="faq-h" className="scroll-mt-6 px-5 pb-24 pt-8 sm:px-8">
          <div className="text-center">
            <h2 id="faq-h" className="text-2xl font-semibold tracking-tight text-ink md:text-[32px]">Frequently Asked Questions</h2>
            <p className="mt-3 text-muted">Everything you need to know about clinical trials and Trial Nexus.</p>
          </div>
          <ul className="mx-auto mt-12 max-w-[820px] space-y-3">
            {faqs.map((f, i) => <FaqItem key={f.q} {...f} defaultOpen={i === 0} />)}
          </ul>
        </section>
      </main>

      <Footer data={footer} />
    </div>
  )
}
