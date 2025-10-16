'use client';
import StudentHome from '@/components/shared/StudentHome';

const Page = () => {
    return (
        <StudentHome 
            showUserInfo={true}
            redirectTo="/dashboard/student-equivalence"
        />
    );
};

export default Page;