import PageMeta from "@/components/dashboard/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Login Dashboard | Makula Bahalap"
        description="Login ke dashboard admin Klinik Spesialis Mata Makula Bahalap"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}



