'use client';

import { AuthCheck } from '@/components/admin/auth-check';
import { QuestionTable } from '@/components/admin/question-table';

export default function AdminPage() {
  return (
    <AuthCheck>
      <div className="space-y-8">
        <QuestionTable />
      </div>
    </AuthCheck>
  );
}
