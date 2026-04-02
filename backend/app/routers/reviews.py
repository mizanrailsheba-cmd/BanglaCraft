from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

from ..dependencies import get_db, admin_required

router = APIRouter(prefix='/api/reviews', tags=['reviews'])


# ── Pydantic Schemas ──────────────────────────────────────────────

class ReviewCreate(BaseModel):
    product_id: str
    reviewer_name: str
    rating: int
    comment: str

class ReviewOut(BaseModel):
    id: str
    product_id: str
    reviewer_name: str
    rating: int
    comment: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Submit a review (anyone) ──────────────────────────────────────

@router.post('/', response_model=ReviewOut)
def submit_review(data: ReviewCreate, db: Session = Depends(get_db)):
    if not 1 <= data.rating <= 5:
        raise HTTPException(400, 'Rating must be between 1 and 5')
    if not data.reviewer_name.strip():
        raise HTTPException(400, 'Reviewer name is required')
    if not data.comment.strip():
        raise HTTPException(400, 'Comment is required')

    review = db.execute(
        text("""
            INSERT INTO reviews (id, product_id, reviewer_name, rating, comment, is_approved, created_at)
            VALUES (:id, :product_id, :reviewer_name, :rating, :comment, false, now())
            RETURNING id, product_id, reviewer_name, rating, comment, is_approved, created_at
        """),
        {
            'id': str(uuid.uuid4()),
            'product_id': data.product_id,
            'reviewer_name': data.reviewer_name.strip(),
            'rating': data.rating,
            'comment': data.comment.strip(),
        }
    ).fetchone()

    db.commit()
    return dict(review._mapping)


# ── Get approved reviews for a product (public) ───────────────────

@router.get('/product/{product_id}', response_model=List[ReviewOut])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    reviews = db.execute(
        text("""
            SELECT id, product_id, reviewer_name, rating, comment, is_approved, created_at
            FROM reviews
            WHERE product_id = :product_id AND is_approved = true
            ORDER BY created_at DESC
        """),
        {'product_id': product_id}
    ).fetchall()
    return [dict(r._mapping) for r in reviews]


# ── Admin: get all reviews ────────────────────────────────────────

@router.get('/admin/all')
def get_all_reviews(db: Session = Depends(get_db), _=Depends(admin_required)):
    reviews = db.execute(
        text("""
            SELECT r.id, r.product_id, r.reviewer_name, r.rating, r.comment,
                   r.is_approved, r.created_at, p.name_en as product_name
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        """)
    ).fetchall()
    return [dict(r._mapping) for r in reviews]


# ── Admin: approve review ─────────────────────────────────────────

@router.put('/admin/{review_id}/approve')
def approve_review(review_id: str, db: Session = Depends(get_db), _=Depends(admin_required)):
    result = db.execute(
        text("UPDATE reviews SET is_approved = true WHERE id = :id RETURNING id"),
        {'id': review_id}
    ).fetchone()
    if not result:
        raise HTTPException(404, 'Review not found')
    db.commit()
    return {'status': 'approved'}


# ── Admin: delete review ──────────────────────────────────────────

@router.delete('/admin/{review_id}')
def delete_review(review_id: str, db: Session = Depends(get_db), _=Depends(admin_required)):
    result = db.execute(
        text("DELETE FROM reviews WHERE id = :id RETURNING id"),
        {'id': review_id}
    ).fetchone()
    if not result:
        raise HTTPException(404, 'Review not found')
    db.commit()
    return {'status': 'deleted'}