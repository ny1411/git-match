import { type FC } from 'react';
import LoginForm from '../components/login/LoginForm';
import LoginHeroPanel from '../components/login/LoginHeroPanel';
import LoginModeToggle from '../components/login/LoginModeToggle';
import { useLoginForm } from '../hooks/useLoginForm';

const Login: FC = () => {
  const { loginMode, formData, status, actionLabel, handleChange, setMode, submit } = useLoginForm();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0a1e] p-4">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#1c1b2e]/80 shadow-2xl backdrop-blur-md md:flex-row">
        <div className="relative flex w-full flex-col p-8 md:w-5/12 md:p-12">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-linear-to-br from-purple-900/20 via-transparent to-transparent" />

          <LoginModeToggle mode={loginMode} onChangeMode={setMode} />

          <LoginForm
            mode={loginMode}
            formData={formData}
            loading={status.loading}
            error={status.error}
            actionLabel={actionLabel}
            onChange={handleChange}
            onSubmit={() => {
              void submit();
            }}
          />
        </div>

        <LoginHeroPanel />
      </div>
    </div>
  );
};

export default Login;
