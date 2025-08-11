import { requireAdmin } from '@/utils/auth-guard';
import IntakeForm from '../../../../../components/Admin/Intakes/intake-form';

export default async function NewIntakePage() {
  await requireAdmin();
  return <IntakeForm formTitle="Create new Intake Form" />;
}
