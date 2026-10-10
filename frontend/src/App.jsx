import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  LogOut,
  UserRound,
} from 'lucide-react';
import AuthPage from './components/AuthPage';
import MacroCards from './components/MacroCards';
import MacroChart from './components/MacroChart';
import WeightChart from './components/WeightChart';
import {
  generatePlan,
  getCurrentPlan,
  getProfile,
  getWeightHistory,
  saveProfile,
  signIn,
  signUp,
} from './api';

const goalMeta = {
  CUT: { label: 'Cut', description: 'A measured calorie deficit to support gradual fat loss.' },
  LEAN_BULK: { label: 'Lean bulk', description: 'A modest surplus to support gradual muscle gain.' },
  BULK: { label: 'Aggressive bulk', description: 'A larger calorie surplus to support faster weight gain.' },
};

const activityLabels = {
  SEDENTARY: 'Sedentary',
  LIGHT: 'Light',
  MODERATE: 'Moderate',
  ACTIVE: 'Active',
  VERY_ACTIVE: 'Very active',
};

const splitOptions = [
  { value: 'FULL_BODY_3_DAY', label: '3-day full body', note: 'Three balanced sessions with recovery days between.' },
  { value: 'UPPER_LOWER_4_DAY', label: '4-day upper/lower', note: 'Two upper and two lower sessions each week.' },
  { value: 'PUSH_PULL_LEGS_5_DAY', label: '5-day push/pull/legs', note: 'A five-session rotation with one rest day midweek.' },
  { value: 'PUSH_PULL_LEGS_6_DAY', label: '6-day push/pull/legs', note: 'A six-session rotation with one full rest day.' },
];

const blankProfile = {
  age: '',
  gender: 'MALE',
  heightCm: '',
  weightKg: '',
  neckCm: '',
  waistCm: '',
  hipCm: '',
  activityLevel: 'MODERATE',
  profession: '',
  workoutSplitType: 'UPPER_LOWER_4_DAY',
};

function toProfileForm(profile = {}) {
  return {
    age: profile.age ?? '',
    gender: profile.gender ?? 'MALE',
    heightCm: profile.heightCm ?? '',
    weightKg: profile.weightKg ?? '',
    neckCm: profile.neckCm ?? '',
    waistCm: profile.waistCm ?? '',
    hipCm: profile.hipCm ?? '',
    activityLevel: profile.activityLevel ?? 'MODERATE',
    profession: profile.profession ?? '',
    workoutSplitType: profile.workoutSplitType ?? 'UPPER_LOWER_4_DAY',
  };
}

function formatWorkoutDays(plan) {
  return plan?.workoutPlans ?? [];
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('fitnessPlannerToken'));
  const [profile, setProfile] = useState(blankProfile);
  const [goal, setGoal] = useState('LEAN_BULK');
  const [plan, setPlan] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refreshDashboard(authToken) {
    const [currentProfile, currentPlan, history] = await Promise.all([
      getProfile(authToken),
      getCurrentPlan(authToken).catch((requestError) => {
        if (requestError.status === 404) return null;
        throw requestError;
      }),
      getWeightHistory(authToken),
    ]);
    setProfile(toProfileForm(currentProfile));
    setWeightHistory(history);
    setPlan(currentPlan);
    if (currentPlan?.goal) setGoal(currentPlan.goal);
    if (!currentProfile.weightKg || !currentProfile.profession || !currentPlan) {
      setStep(0);
      setNotice('Let’s finish your profile and build a plan around your routine.');
    } else {
      setNotice('');
    }
  }

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        await refreshDashboard(token);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function authenticate(credentials, registering) {
    setBusy(true);
    setError('');
    try {
      const session = registering ? await signUp(credentials) : await signIn(credentials);
      sessionStorage.setItem('fitnessPlannerToken', session.token);
      setToken(session.token);
    } catch (requestError) {
      sessionStorage.removeItem('fitnessPlannerToken');
      setToken(null);
      setError(requestError.message);
      throw requestError;
    } finally {
      setBusy(false);
    }
  }

  function updateProfile(field, value) {
    setProfile((previous) => ({ ...previous, [field]: value }));
  }

  function continueToTraining() {
    const age = Number(profile.age);
    const height = Number(profile.heightCm);
    const weight = Number(profile.weightKg);
    const neck = Number(profile.neckCm);
    const waist = Number(profile.waistCm);
    const hips = Number(profile.hipCm);

    if (!profile.profession.trim()) {
      setError('Please add your profession or typical work routine.');
    } else if (age < 16 || age > 100 || height < 100 || height > 250 || weight < 30 || weight > 400) {
      setError('Check your age, height, and weight values and try again.');
    } else if ([neck, waist, hips].some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('Enter positive values for all body measurements.');
    } else if ((profile.gender === 'MALE' && waist <= neck) || (profile.gender === 'FEMALE' && waist + hips <= neck)) {
      setError('Check the measurements: waist (and hips when applicable) must be greater than neck.');
    } else {
      setError('');
      setStep(1);
    }
  }

  async function createPlan(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    const requestProfile = {
      age: Number(profile.age),
      gender: profile.gender,
      heightCm: Number(profile.heightCm),
      weightKg: Number(profile.weightKg),
      neckCm: Number(profile.neckCm),
      waistCm: Number(profile.waistCm),
      hipCm: Number(profile.hipCm),
      activityLevel: profile.activityLevel,
      profession: profile.profession.trim(),
      workoutSplitType: profile.workoutSplitType,
    };

    try {
      await saveProfile(token, requestProfile);
      const newPlan = await generatePlan(token, {
        goal,
        activityLevel: profile.activityLevel,
      });
      const history = await getWeightHistory(token);
      setWeightHistory(history);
      setPlan(newPlan);
      setNotice('Your plan is ready. Targets are based on your profile and can be refreshed any time.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem('fitnessPlannerToken');
    setToken(null);
    setPlan(null);
    setWeightHistory([]);
    setProfile(blankProfile);
    setError('');
    setNotice('');
  }

  if (!token) {
    return <AuthPage onAuthenticate={authenticate} />;
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center text-slate-600">Loading your profile…</main>;
  }

  const historyData = weightHistory.map((entry) => ({
    date: entry.loggedDate,
    weight: entry.weightKg,
  }));
  const splitLabel =
    splitOptions.find((option) => option.value === profile.workoutSplitType)?.label ??
    plan?.workoutSplitType ??
    'Workout split';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Fitness Planner</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your fitness, thoughtfully planned.</h1>
          <p className="mt-2 text-slate-600">Share your routine and goals to get personal nutrition and training targets.</p>
        </div>
        <button type="button" onClick={signOut} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-center">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      {(notice || error) && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role={error ? 'alert' : 'status'}>
          {error || notice}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Step {step + 1} of 2</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{step === 0 ? 'Your body & routine' : 'Your goal & training'}</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 sm:flex">
              <BadgeCheck className="h-4 w-4" /> Private account
            </div>
          </div>

          <form onSubmit={createPlan}>
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Age
                  <input required min="16" max="100" type="number" value={profile.age} onChange={(event) => updateProfile('age', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Gender for BMR estimate
                  <select value={profile.gender} onChange={(event) => updateProfile('gender', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white">
                    <option value="MALE">Male</option><option value="FEMALE">Female</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Height (cm)
                  <input required min="100" max="250" type="number" step="0.1" value={profile.heightCm} onChange={(event) => updateProfile('heightCm', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Current weight (kg)
                  <input required min="30" max="400" type="number" step="0.1" value={profile.weightKg} onChange={(event) => updateProfile('weightKg', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Neck (cm)
                  <input required min="10" max="100" type="number" step="0.1" value={profile.neckCm} onChange={(event) => updateProfile('neckCm', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Waist (cm)
                  <input required min="20" max="250" type="number" step="0.1" value={profile.waistCm} onChange={(event) => updateProfile('waistCm', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Hips (cm)
                  <input required min="20" max="250" type="number" step="0.1" value={profile.hipCm} onChange={(event) => updateProfile('hipCm', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700">Daily activity
                  <select value={profile.activityLevel} onChange={(event) => updateProfile('activityLevel', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white">
                    {Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Profession or typical work
                  <input required maxLength="120" placeholder="For example: student, nurse, office-based, construction" value={profile.profession} onChange={(event) => updateProfile('profession', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500 focus:bg-white" />
                  <span className="block text-xs font-normal text-slate-500">This helps us understand your routine alongside your selected activity level.</span>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-slate-700">What’s your primary goal?</legend>
                  <div className="space-y-3">
                    {Object.entries(goalMeta).map(([value, meta]) => (
                      <button key={value} type="button" onClick={() => setGoal(value)} className={`w-full rounded-2xl border p-4 text-left transition ${goal === value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                        <span className="flex items-center justify-between gap-4">
                          <span><span className="block font-semibold text-slate-900">{meta.label}</span><span className="mt-1 block text-sm font-normal text-slate-600">{meta.description}</span></span>
                          {goal === value && <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-slate-700">Choose your workout split</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {splitOptions.map((option) => (
                      <button key={option.value} type="button" onClick={() => updateProfile('workoutSplitType', option.value)} className={`rounded-2xl border p-4 text-left transition ${profile.workoutSplitType === option.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                        <span className="block font-semibold text-slate-900">{option.label}</span><span className="mt-1 block text-sm text-slate-600">{option.note}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-3">
              <button type="button" onClick={() => setStep((previous) => Math.max(0, previous - 1))} disabled={step === 0 || busy} className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Back</button>
              {step === 0 ? (
                <button type="button" onClick={continueToTraining} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800">Continue <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button disabled={busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">{busy ? 'Building your plan…' : 'Build my plan'} <Activity className="h-4 w-4" /></button>
              )}
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-6 w-6 text-emerald-300" />
              <div><p className="text-sm uppercase tracking-[0.15em] text-slate-300">Training preference</p><h3 className="mt-1 text-xl font-semibold">{splitLabel}</h3></div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-300">Your work routine</p>
              <p className="mt-1 font-semibold">{profile.profession || 'Add your profession in your profile'}</p>
            </div>
            {plan && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-300">BMR</p><p className="mt-1 text-2xl font-bold">{Math.round(plan.bmr)}</p></div>
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-300">TDEE</p><p className="mt-1 text-2xl font-bold">{Math.round(plan.tdee)}</p></div>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-semibold text-slate-900">How your plan is built</h3></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Your energy and macro targets are calculated from your current measurements, activity level, and goal. Your selected split determines the training days and exercises.</p>
          </div>
        </aside>
      </div>

      {plan && (
        <main className="mt-10 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-700">Your current plan</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{goalMeta[plan.goal]?.label ?? plan.goal} · {plan.workoutSplitType}</h2></div>
            <div className="text-sm text-slate-500">Profession: <span className="font-medium text-slate-700">{plan.profession || profile.profession}</span></div>
          </div>
          <MacroCards plan={plan} />
          <div className="grid gap-8 xl:grid-cols-2">
            <MacroChart plan={plan} />
            <WeightChart data={historyData} />
          </div>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3"><Dumbbell className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-semibold text-slate-900">Your weekly workout schedule</h3></div>
            {formatWorkoutDays(plan).length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {formatWorkoutDays(plan).map((day) => (
                  <article key={day.id ?? `${day.dayOfWeek}-${day.focusArea}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">{day.dayOfWeek}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{day.focusArea}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{day.exercises}</p>
                  </article>
                ))}
              </div>
            ) : <p className="text-sm text-slate-600">No workout sessions are currently available for this plan.</p>}
          </section>
        </main>
      )}
    </div>
  );
}
