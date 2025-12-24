package model

import "github.com/QuantumNous/new-api/common"

const (
	FAQBoardPostStatusPending  = 0
	FAQBoardPostStatusApproved = 1
	FAQBoardPostStatusRejected = 2
)

type FAQBoardPost struct {
	Id          int    `json:"id" gorm:"primaryKey"`
	UserId      int    `json:"user_id" gorm:"not null;index:idx_faq_user_created,priority:1"`
	UserName    string `json:"user_name" gorm:"type:varchar(64)"`
	Title       string `json:"title" gorm:"type:varchar(200)"`
	Question    string `json:"question" gorm:"type:text;not null"`
	Solution    string `json:"solution" gorm:"type:text"`
	Status      int    `json:"status" gorm:"type:int;not null;default:0;index:idx_faq_status_created,priority:1"`
	ReviewNote  string `json:"review_note" gorm:"type:varchar(500)"`
	ReviewedBy  int    `json:"reviewed_by" gorm:"type:int;default:0"`
	ReviewedAt  int64  `json:"reviewed_at" gorm:"bigint;default:0"`
	AdminReply  string `json:"admin_reply" gorm:"type:text"`
	RepliedBy   int    `json:"replied_by" gorm:"type:int;default:0"`
	RepliedAt   int64  `json:"replied_at" gorm:"bigint;default:0"`
	CreatedAt   int64  `json:"created_at" gorm:"bigint;not null;index:idx_faq_status_created,priority:2;index:idx_faq_user_created,priority:2"`
	UpdatedAt   int64  `json:"updated_at" gorm:"bigint;not null"`
}

func (p *FAQBoardPost) Insert() error {
	now := common.GetTimestamp()
	p.CreatedAt = now
	p.UpdatedAt = now
	p.Status = FAQBoardPostStatusPending
	return DB.Create(p).Error
}

func (p *FAQBoardPost) Update() error {
	p.UpdatedAt = common.GetTimestamp()
	return DB.Model(p).Select("title", "question", "solution", "status", "review_note", "reviewed_by", "reviewed_at", "admin_reply", "replied_by", "replied_at", "updated_at").Updates(p).Error
}

func GetFAQBoardPostById(id int) (*FAQBoardPost, error) {
	var post FAQBoardPost
	err := DB.First(&post, id).Error
	return &post, err
}

func GetApprovedFAQBoardPosts(page, pageSize int) ([]*FAQBoardPost, int64, error) {
	var posts []*FAQBoardPost
	var total int64
	db := DB.Model(&FAQBoardPost{}).Where("status = ?", FAQBoardPostStatusApproved)
	err := db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Order("created_at desc").Limit(pageSize).Offset((page - 1) * pageSize).Find(&posts).Error
	return posts, total, err
}

func GetFAQBoardPostsByUser(userId, page, pageSize int) ([]*FAQBoardPost, int64, error) {
	var posts []*FAQBoardPost
	var total int64
	db := DB.Model(&FAQBoardPost{}).Where("user_id = ?", userId)
	err := db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Order("created_at desc").Limit(pageSize).Offset((page - 1) * pageSize).Find(&posts).Error
	return posts, total, err
}

func GetFAQBoardPostsByStatus(status, page, pageSize int) ([]*FAQBoardPost, int64, error) {
	var posts []*FAQBoardPost
	var total int64
	db := DB.Model(&FAQBoardPost{})
	if status >= 0 {
		db = db.Where("status = ?", status)
	}
	err := db.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = db.Order("created_at desc").Limit(pageSize).Offset((page - 1) * pageSize).Find(&posts).Error
	return posts, total, err
}

func DeleteFAQBoardPost(id int) error {
	return DB.Delete(&FAQBoardPost{}, id).Error
}
