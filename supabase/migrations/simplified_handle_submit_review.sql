-- 简化版：只使用课程名称匹配或创建课程
CREATE OR REPLACE FUNCTION public.handle_submit_review(
    review_data JSONB
) RETURNS JSONB 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_teacher_id UUID;
    v_new_review_id UUID;
    v_course_id UUID;
    v_course_name TEXT;
    v_course_tags JSONB;
    v_course_reviews JSONB;
    v_current_avg NUMERIC;
    v_current_roll_call_count INT;
    v_new_roll_call_count INT;
    v_roll_call_percentage NUMERIC;
    v_result JSONB;
    v_rating NUMERIC;
    v_comment TEXT;
    v_review_item JSONB;
    v_processed_courses UUID[] := '{}'; -- 跟踪已处理过的课程ID，避免重复计数
BEGIN
    -- 开始事务
    BEGIN
        -- 从JSON中提取数据
        v_teacher_id := review_data->>'teacher_id';
        v_rating := (review_data->>'rating')::NUMERIC;
        v_comment := review_data->>'comment';
        
        -- 验证教师ID存在
        IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = v_teacher_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '教师ID不存在'
            );
        END IF;
        
        -- 验证评分范围 (0.5-5分，步长为0.5)
        IF v_rating < 0.5 OR v_rating > 5 OR MOD(v_rating * 10, 5) != 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '评分必须在0.5-5分之间，且是0.5的倍数'
            );
        END IF;
        
        -- 验证评论文本（现在是必填项）
        IF v_comment IS NULL OR TRIM(v_comment) = '' THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '评价内容不能为空'
            );
        END IF;

        -- 插入总体评价
        INSERT INTO public.reviews (
            teacher_id,
            rating,
            comment,
            does_roll_call,
            submitter_hash
        ) VALUES (
            v_teacher_id,
            v_rating,
            v_comment,
            (review_data->>'does_roll_call')::BOOLEAN,
            review_data->>'submitter_hash'
        )
        RETURNING id INTO v_new_review_id;
        
        -- 处理课程标签
        IF review_data ? 'course_tags' AND jsonb_array_length(review_data->'course_tags') > 0 THEN
            v_course_tags := review_data->'course_tags';
            
            FOR i IN 0..jsonb_array_length(v_course_tags) - 1 LOOP
                v_course_name := v_course_tags->i->>'course_name';
                
                -- 检查课程是否存在，不存在则创建
                IF NOT EXISTS (SELECT 1 FROM public.courses WHERE courses.course_name = v_course_name) THEN
                    INSERT INTO public.courses (course_name) 
                    VALUES (v_course_name)
                    RETURNING id INTO v_course_id;
                ELSE
                    SELECT id INTO v_course_id FROM public.courses WHERE courses.course_name = v_course_name;
                END IF;
                
                -- 检查这个课程是否已经在此次提交中处理过（避免重复计数）
                IF NOT (v_course_id = ANY(v_processed_courses)) THEN
                    -- 更新教师-课程关联
                    IF EXISTS (SELECT 1 FROM public.teacher_course_associations WHERE teacher_id = v_teacher_id AND course_id = v_course_id) THEN
                        -- 关联已存在，增加计数
                        UPDATE public.teacher_course_associations 
                        SET association_count = association_count + 1 
                        WHERE teacher_id = v_teacher_id AND course_id = v_course_id;
                    ELSE
                        -- 创建新关联
                        INSERT INTO public.teacher_course_associations (teacher_id, course_id) 
                        VALUES (v_teacher_id, v_course_id);
                    END IF;
                    
                    -- 记录已处理过的课程ID
                    v_processed_courses := v_processed_courses || v_course_id;
                END IF;
            END LOOP;
        END IF;
        
        -- 处理课程评价 - 简化为只使用课程名称
        IF review_data ? 'course_reviews' AND jsonb_array_length(review_data->'course_reviews') > 0 THEN
            v_course_reviews := review_data->'course_reviews';
            
            FOR i IN 0..jsonb_array_length(v_course_reviews) - 1 LOOP
                v_review_item := v_course_reviews->i;
                
                -- 兼容旧版本：通过type和course_id提交的情况
                IF v_review_item ? 'type' AND (v_review_item->>'type') = 'id' AND v_review_item ? 'course_id' THEN
                    v_course_id := (v_review_item->>'course_id')::UUID;
                    
                    -- 确保课程存在
                    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = v_course_id) THEN
                        CONTINUE; -- 跳过不存在的课程
                    END IF;
                    
                -- 主要方式：通过课程名称
                ELSE
                    -- 获取课程名称（兼容新旧格式）
                    v_course_name := COALESCE(v_review_item->>'course_name', '');
                    
                    -- 如果没有提供课程名称，跳过
                    IF v_course_name = '' THEN
                        CONTINUE;
                    END IF;
                    
                    -- 查找或创建课程
                    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE courses.course_name = v_course_name) THEN
                        INSERT INTO public.courses (course_name) 
                        VALUES (v_course_name)
                        RETURNING id INTO v_course_id;
                    ELSE
                        SELECT id INTO v_course_id FROM public.courses WHERE courses.course_name = v_course_name;
                    END IF;
                END IF;
                
                -- 检查这个课程是否已经在此次提交中处理过（避免重复计数）
                IF NOT (v_course_id = ANY(v_processed_courses)) THEN
                    -- 确保教师与该课程有关联
                    IF NOT EXISTS (SELECT 1 FROM public.teacher_course_associations 
                                  WHERE teacher_id = v_teacher_id AND course_id = v_course_id) THEN
                        INSERT INTO public.teacher_course_associations (teacher_id, course_id) 
                        VALUES (v_teacher_id, v_course_id);
                    ELSE
                        -- 增加关联计数
                        UPDATE public.teacher_course_associations 
                        SET association_count = association_count + 1 
                        WHERE teacher_id = v_teacher_id AND course_id = v_course_id;
                    END IF;
                    
                    -- 记录已处理过的课程ID
                    v_processed_courses := v_processed_courses || v_course_id;
                END IF;
                
                -- 验证课程评分范围 (0.5-5分，步长为0.5)
                DECLARE
                    v_course_rating NUMERIC := (v_review_item->>'course_rating')::NUMERIC;
                BEGIN
                    IF v_course_rating < 0.5 OR v_course_rating > 5 OR MOD(v_course_rating * 10, 5) != 0 THEN
                        CONTINUE;  -- 跳过无效的评分
                    END IF;
                
                    -- 插入课程评价
                    INSERT INTO public.course_reviews (
                        review_id,
                        teacher_id,
                        course_id,
                        course_rating,
                        course_comment
                    ) VALUES (
                        v_new_review_id,
                        v_teacher_id,
                        v_course_id,
                        v_course_rating,
                        v_review_item->>'course_comment'
                    );
                END;
            END LOOP;
        END IF;
        
        -- 更新教师的聚合数据
        -- 1. 计算新的平均分
        SELECT AVG(rating)::NUMERIC(3,2) INTO v_current_avg 
        FROM public.reviews 
        WHERE teacher_id = v_teacher_id;
        
        -- 2. 计算新的点名率
        SELECT COUNT(*) INTO v_current_roll_call_count 
        FROM public.reviews 
        WHERE teacher_id = v_teacher_id AND does_roll_call = true;
        
        SELECT COUNT(*) INTO v_new_roll_call_count 
        FROM public.reviews 
        WHERE teacher_id = v_teacher_id;
        
        v_roll_call_percentage := (v_current_roll_call_count::NUMERIC / v_new_roll_call_count) * 100;
        
        -- 3. 更新教师表
        UPDATE public.teachers 
        SET 
            review_count = v_new_roll_call_count,
            avg_rating = v_current_avg,
            roll_call_percentage = v_roll_call_percentage
        WHERE id = v_teacher_id;
        
        -- 构建成功响应
        v_result := jsonb_build_object(
            'success', true,
            'review_id', v_new_review_id,
            'message', '评价提交成功'
        );
        
        RETURN v_result;
    EXCEPTION WHEN OTHERS THEN
        -- 任何错误都回滚事务
        RAISE;
    END;
END;
$$; 