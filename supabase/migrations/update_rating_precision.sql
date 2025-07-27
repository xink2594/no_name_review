-- 更新评分字段以支持0.5分精度
-- 创建时间: 2024年

-- 1. 更新 reviews 表的 rating 字段
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_rating_check;

ALTER TABLE public.reviews 
ALTER COLUMN rating TYPE NUMERIC(2,1);

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 0.5 AND rating <= 5.0 AND MOD(rating * 10, 5) = 0);

-- 2. 更新 course_reviews 表的 course_rating 字段
ALTER TABLE public.course_reviews 
DROP CONSTRAINT IF EXISTS course_reviews_course_rating_check;

ALTER TABLE public.course_reviews 
ALTER COLUMN course_rating TYPE NUMERIC(2,1);

ALTER TABLE public.course_reviews 
ADD CONSTRAINT course_reviews_course_rating_check 
CHECK (course_rating >= 0.5 AND course_rating <= 5.0 AND MOD(course_rating * 10, 5) = 0);

-- 3. 更新注释
COMMENT ON COLUMN public.reviews.rating IS '整体评分，0.5-5.0，步长0.5';
COMMENT ON COLUMN public.course_reviews.course_rating IS '课程评分，0.5-5.0，步长0.5';
COMMENT ON COLUMN public.teachers.avg_rating IS '教师的综合平均分，支持0.5分精度';

-- 4. 验证数据一致性（可选）
-- 检查是否有不符合新约束的数据
DO $$
DECLARE
    invalid_reviews_count INTEGER;
    invalid_course_reviews_count INTEGER;
BEGIN
    -- 检查 reviews 表
    SELECT COUNT(*) INTO invalid_reviews_count 
    FROM public.reviews 
    WHERE rating < 0.5 OR rating > 5.0 OR MOD(rating * 10, 5) != 0;
    
    -- 检查 course_reviews 表
    SELECT COUNT(*) INTO invalid_course_reviews_count 
    FROM public.course_reviews 
    WHERE course_rating < 0.5 OR course_rating > 5.0 OR MOD(course_rating * 10, 5) != 0;
    
    IF invalid_reviews_count > 0 THEN
        RAISE WARNING '发现 % 条 reviews 记录不符合新的评分约束', invalid_reviews_count;
    END IF;
    
    IF invalid_course_reviews_count > 0 THEN
        RAISE WARNING '发现 % 条 course_reviews 记录不符合新的评分约束', invalid_course_reviews_count;
    END IF;
    
    RAISE NOTICE '评分字段精度更新完成，支持0.5分精度';
END $$; 