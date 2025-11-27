import React from 'react';
import { Stadium } from '@/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { MapPin, DollarSign, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StadiumCardProps {
  stadium: Stadium;
}

const StadiumCard: React.FC<StadiumCardProps> = ({ stadium }) => {
  const router = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="relative h-48 bg-gray-200">
        {/* Placeholder for Stadium Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-300/50">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 rtl:left-3 ltr:right-3 bg-accent text-white font-bold p-2 rounded-full flex items-center shadow-lg">
          {stadium.average_rating.toFixed(1)} <Star className="h-4 w-4 rtl:mr-1 ltr:ml-1 fill-white" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{stadium.name}</h3>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <MapPin className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" />
          <span className="truncate">{stadium.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-600 font-bold text-lg">
            <DollarSign className="h-5 w-5 rtl:ml-1 ltr:mr-1" />
            <span>{stadium.price_per_hour} / ساعة</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
            {stadium.amenities.slice(0, 3).map(amenity => (
                <Badge key={amenity} variant='info'>{amenity}</Badge>
            ))}
            {stadium.amenities.length > 3 && (
                <Badge variant='secondary'>+{stadium.amenities.length - 3} المزيد</Badge>
            )}
        </div>

        <div className="pt-4">
          <Button 
            className="w-full" 
            onClick={() => router.push(`/stadiums/${stadium.id}`)}
          >
            عرض التفاصيل والحجز
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StadiumCard;
