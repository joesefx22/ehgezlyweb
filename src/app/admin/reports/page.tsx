'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';
import { Loader2, FileText, Download, BarChart2 } from 'lucide-react';

/**
 * صفحة التقارير والإحصائيات المفصلة (لـ Admin)
 */
const AdminReportsPage: React.FC = () => {
  const { data: reportData, isLoading, error, execute } = useApi<any>(false);
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerateReport = () => {
    execute(`/admin/reports/generate?type=${reportType}&start_date=${startDate}&end_date=${endDate}`);
  };

  const MockReportData = {
    revenue: 15000,
    totalBookings: 250,
    topStadium: 'ملعب النجوم',
    topOwner: 'أحمد علي',
    details: [
        { date: '2024-09-01', bookings: 10, revenue: 500 },
        { date: '2024-09-02', bookings: 12, revenue: 600 },
    ]
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">التقارير المالية والتشغيلية</h1>
        
        {/* Report Controls */}
        <Card title="إنشاء تقرير جديد">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">نوع التقرير</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="form-input">
                <option value="monthly">شهري</option>
                <option value="quarterly">ربع سنوي</option>
                <option value="yearly">سنوي</option>
                <option value="custom">مخصص</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">من تاريخ</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
            </div>
            <Button onClick={handleGenerateReport} isLoading={isLoading} className="h-10">
              <BarChart2 className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
              توليد التقرير
            </Button>
          </div>
        </Card>

        {/* Report Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
            <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            <span>خطأ في توليد التقرير: {error}</span>
          </Card>
        )}
        
        {!isLoading && reportData && (
          <Card title={`نتائج التقرير (${reportType})`}>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary dark:text-secondary mb-3">ملخص:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReportSummaryItem title="إجمالي الإيرادات" value={`${MockReportData.revenue.toLocaleString()} د.ع`} />
                    <ReportSummaryItem title="إجمالي الحجوزات" value={MockReportData.totalBookings.toLocaleString()} />
                    <ReportSummaryItem title="أفضل ملعب" value={MockReportData.topStadium} />
                    <ReportSummaryItem title="أفضل مالك" value={MockReportData.topOwner} />
                </div>

                <h3 className="text-xl font-bold text-primary dark:text-secondary mt-6 mb-3">تفاصيل اليوميات:</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحجوزات</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإيرادات (د.ع)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                            {MockReportData.details.map((detail, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{detail.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">{detail.bookings}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{detail.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <Button variant="secondary">
                        <Download className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                        تنزيل كـ PDF
                    </Button>
                </div>
            </div>
          </Card>
        )}
        
        {!reportData && !isLoading && (
            <Card className="text-center p-8 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-3" />
                قم بتحديد معايير التقرير واضغط "توليد التقرير" لعرض النتائج هنا.
            </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

const ReportSummaryItem: React.FC<{ title: string, value: string | number }> = ({ title, value }) => (
    <div className="p-3 bg-primary/10 rounded-lg border-r-4 border-primary">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
    </div>
);

export default AdminReportsPage;
