import { useQuery } from '@tanstack/react-query'
import { getMedicalHistories, type QueueUser } from '../api'

export function MedicalHistoryContent({
  patient,
}: {
  patient: Pick<QueueUser, 'id' | 'fullName'>
}) {
  const histories = useQuery({
    queryKey: ['medical-histories', patient.id],
    queryFn: () => getMedicalHistories(patient.id),
  })

  if (histories.isLoading) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        Đang tải...
      </p>
    )
  }

  if (!histories.data?.data.length) {
    return (
      <p className='py-8 text-center text-sm text-muted-foreground'>
        Chưa có lịch sử khám.
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {histories.data.data.map((history) => (
        <div key={history.id} className='space-y-2 rounded-lg border p-4'>
          <div className='flex flex-wrap justify-between gap-2'>
            <strong>
              {new Date(history.createdAt).toLocaleString('vi-VN')}
            </strong>
            <span className='text-sm text-muted-foreground'>
              {history.doctorName}
            </span>
          </div>
          <p>
            <span className='text-muted-foreground'>Chẩn đoán:</span>{' '}
            {history.diagnosis || '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>Triệu chứng:</span>{' '}
            {history.symptoms || '—'}
          </p>
          <p>
            <span className='text-muted-foreground'>Điều trị:</span>{' '}
            {history.treatment || '—'}
          </p>
          {history.note && (
            <p>
              <span className='text-muted-foreground'>Ghi chú:</span>{' '}
              {history.note}
            </p>
          )}
          {history.advice && (
            <p>
              <span className='text-muted-foreground'>Lời dặn:</span>{' '}
              {history.advice}
            </p>
          )}
          <div className='mt-3 border-t pt-3'>
            <p className='mb-2 font-medium'>Toa thuốc</p>
            {history.prescription?.items.length ? (
              <div className='overflow-x-auto rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50 text-left'>
                    <tr>
                      <th className='px-3 py-2 font-medium'>Thuốc</th>
                      <th className='px-3 py-2 font-medium'>Số lượng</th>
                      <th className='px-3 py-2 font-medium'>Hướng dẫn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.prescription.items.map((item) => (
                      <tr key={item.id} className='border-t align-top'>
                        <td className='px-3 py-2'>
                          <div className='font-medium'>{item.medicineName}</div>
                          {item.medicine && (
                            <div className='text-xs text-muted-foreground'>
                              {item.medicine.strength} · {item.medicine.unit}
                            </div>
                          )}
                        </td>
                        <td className='px-3 py-2'>{item.quantity ?? '—'}</td>
                        <td className='px-3 py-2'>{item.instruction || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Không có toa thuốc.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
