import { useState } from 'react';
import { Activity, ArrowRight, Dumbbell } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export default function AuthPage({ onAuthenticate }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    password: '',
    age: '',
    gender: 'MALE',
    heightCm: '',
    activityLevel: 'MODERATE',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegistering = mode === 'register';
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await onAuthenticate(
        isRegistering
          ? {
              firstName: form.firstName.trim(),
              email: form.email.trim(),
              password: form.password,
              age: Number(form.age),
              gender: form.gender,
              heightCm: Number(form.heightCm),
              activityLevel: form.activityLevel,
            }
          : { email: form.email.trim(), password: form.password },
        isRegistering,
      );
    } catch (requestError) {
      setError(requestError.message);
      if (isRegistering && requestError.status === 409) {
        setMode('signin');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <section className="flex flex-col justify-between bg-slate-900 p-8 text-white sm:p-10">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
              <Dumbbell className="h-6 w-6" />
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Fitness Planner
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              A plan that fits your life, not just the gym.
            </h1>
            <p className="mt-4 max-w-md text-slate-300">
              Tell us about your goals, routine, and training preference. Get personal calorie,
              macro, and workout targets you can adjust as you progress.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Activity className="h-5 w-5 text-emerald-300" />
            <p className="text-sm text-slate-200">Your profile and plan stay linked to your account.</p>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-600">
            {isRegistering ? 'Get started' : 'Welcome back'}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {isRegistering ? 'Create your account' : 'Sign in'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegistering
              ? 'A few basics help us prepare your personalized setup.'
              : 'Sign in to view and update your fitness plan.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {isRegistering && (
              <>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  First name
                  <input required autoComplete="given-name" className={inputClass} value={form.firstName} onChange={(event) => update('firstName', event.target.value)} />
                </label>
              </>
            )}
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              Email
              <input required type="email" autoComplete="email" className={inputClass} value={form.email} onChange={(event) => update('email', event.target.value)} />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              Password
              <input required type="password" minLength={6} autoComplete={isRegistering ? 'new-password' : 'current-password'} className={inputClass} value={form.password} onChange={(event) => update('password', event.target.value)} />
            </label>

            {isRegistering && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  Age
                  <input required type="number" min="16" max="100" className={inputClass} value={form.age} onChange={(event) => update('age', event.target.value)} />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  Gender for BMR estimate
                  <select className={inputClass} value={form.gender} onChange={(event) => update('gender', event.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  Height (cm)
                  <input required type="number" min="100" max="250" step="0.1" className={inputClass} value={form.heightCm} onChange={(event) => update('heightCm', event.target.value)} />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  Activity level
                  <select className={inputClass} value={form.activityLevel} onChange={(event) => update('activityLevel', event.target.value)}>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="ACTIVE">Active</option>
                    <option value="VERY_ACTIVE">Very active</option>
                  </select>
                </label>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">
              {busy ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegistering ? 'Already have an account?' : 'New to Fitness Planner?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isRegistering ? 'signin' : 'register');
                setError('');
              }}
              className="font-semibold text-emerald-700 hover:text-emerald-600"
            >
              {isRegistering ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
