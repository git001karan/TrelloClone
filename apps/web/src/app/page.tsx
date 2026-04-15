import { AuthGate } from "@/components/auth/auth-gate";
import { WorkspaceHome } from "@/components/workspace/workspace-home";

export default function Home() {
  return (
    <AuthGate>
      <WorkspaceHome />
    </AuthGate>
  );
}
