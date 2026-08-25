
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { EmbeddedAskAI } from './ask-ai/EmbeddedAskAI';

export default function AskAIPage() {
  return (
    <DashboardLayout>
      <div className="h-full relative w-full flex flex-col">
        <EmbeddedAskAI />
      </div>
    </DashboardLayout>
  );
}
