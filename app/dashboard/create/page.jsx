'use client';
import Navbar from '@/components/layout/Navbar';
import DynamicPostForm from '@/components/forms/DynamicPostForm';

export default function CreateBlog() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DynamicPostForm />
    </div>
  );
}
