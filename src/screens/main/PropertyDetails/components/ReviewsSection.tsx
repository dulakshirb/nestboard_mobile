import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Star } from 'lucide-react-native';
import { ReviewAPI } from '../../../../api/reviews';
import { Review } from '../../../../types/review';
import { Colors } from '../../../../constant/colors';
import Typography from '../../../../components/ui/Typography';
import RegularButton from '../../../../components/ui/RegularButton';
import dayjs from 'dayjs';

const AVATAR_COLORS = ['#C9A87C', '#E8652A', '#1A1A2E', '#7C8CA9', '#A87CC9'];

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const StarRow = ({
  value,
  onChange,
  size,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity
        key={n}
        disabled={!onChange}
        onPress={() => onChange?.(n)}
      >
        <Star
          size={size ?? 16}
          color={n <= value ? Colors.PRIMARY_COLOR : '#D1D5DB'}
          fill={n <= value ? Colors.PRIMARY_COLOR : 'transparent'}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ReviewsSection = ({ propertyId }: { propertyId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    ReviewAPI.list(propertyId).then(setReviews);
    ReviewAPI.my(propertyId)
      .then((r) => {
        setMyReview(r);
        if (r) {
          setRating(r.rating);
          setComment(r.comment ?? '');
          setShowForm(true);
        }
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await ReviewAPI.create(propertyId, {
        rating,
        comment: comment.trim() || null,
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
        'Could not submit review. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Typography variant="h2">Reviews</Typography>
        {reviews.length > 0 && (
          <Typography variant="caption">
            {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </Typography>
        )}
      </View>

      {!myReview && !showForm && (
        <RegularButton
          Icon={null}
          text="Write a review"
          onPress={() => setShowForm(true)}
          marginTop={12}
        />
      )}

      {showForm && (
        <View style={styles.form}>
          <Typography variant="subtitle">Your rating</Typography>
          <StarRow value={rating} onChange={setRating} size={28} />
          <TextInput
            style={styles.input}
            placeholder="Share your experience (optional)"
            placeholderTextColor={Colors.TEXT_GRAY}
            multiline
            maxLength={1000}
            value={comment}
            onChangeText={setComment}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <RegularButton
            Icon={null}
            text={myReview ? 'Update review' : 'Submit review'}
            loading={submitting}
            onPress={submit}
            marginTop={8}
          />
        </View>
      )}

      {loading ? (
        <Text style={styles.hint}>Loading reviews...</Text>
      ) : reviews.length === 0 && !showForm ? (
        <Text style={styles.hint}>No reviews yet.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.review}>
            <View style={styles.reviewHeader}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      AVATAR_COLORS[
                      review.user.id.charCodeAt(0) % AVATAR_COLORS.length
                      ],
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {initials(review.user.displayName)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="subtitle">
                  {review.user.displayName}
                </Typography>
                <Typography variant="caption">
                  {dayjs(review.createdAt).format('MMM D, YYYY')}
                </Typography>
              </View>
              <StarRow value={review.rating} />
            </View>
            {review.comment ? (
              <Typography variant="body" style={{ marginTop: 8 }}>
                {review.comment}
              </Typography>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
};

export default ReviewsSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  form: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_GRAY,
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
  },
  input: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_GRAY,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  review: {
    gap: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
  },
  hint: {
    color: Colors.TEXT_GRAY,
    fontSize: 13,
  },
});