import ResetPasswordForm from "@/components/ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ResetPasswordForm token={firstValue(params.token)} />;
}
