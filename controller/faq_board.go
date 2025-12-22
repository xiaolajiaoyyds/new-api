package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type FAQBoardPostRequest struct {
	Id       int    `json:"id"`
	Title    string `json:"title"`
	Question string `json:"question"`
	Solution string `json:"solution"`
}

type FAQBoardReviewRequest struct {
	ReviewNote string `json:"review_note"`
}

func GetFAQBoardPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 20
	}

	posts, total, err := model.GetApprovedFAQBoardPosts(page, pageSize)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": posts, "total": total})
}

func GetMyFAQBoardPosts(c *gin.Context) {
	userId := c.GetInt("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 20
	}

	posts, total, err := model.GetFAQBoardPostsByUser(userId, page, pageSize)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": posts, "total": total})
}

func CreateFAQBoardPost(c *gin.Context) {
	var req FAQBoardPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid request"})
		return
	}
	req.Title = strings.TrimSpace(req.Title)
	req.Question = strings.TrimSpace(req.Question)
	req.Solution = strings.TrimSpace(req.Solution)

	if req.Question == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "question is required"})
		return
	}
	if len(req.Question) > 2000 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "question too long"})
		return
	}
	if len(req.Title) > 200 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "title too long"})
		return
	}
	if len(req.Solution) > 8000 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "solution too long"})
		return
	}

	post := &model.FAQBoardPost{
		UserId:   c.GetInt("id"),
		UserName: c.GetString("username"),
		Title:    req.Title,
		Question: req.Question,
		Solution: req.Solution,
	}
	if err := post.Insert(); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "submitted, waiting for approval", "data": gin.H{"id": post.Id}})
}

func UpdateFAQBoardPost(c *gin.Context) {
	var req FAQBoardPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid request"})
		return
	}
	if req.Id == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "id is required"})
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Question = strings.TrimSpace(req.Question)
	req.Solution = strings.TrimSpace(req.Solution)

	if req.Question == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "question is required"})
		return
	}
	if len(req.Question) > 2000 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "question too long"})
		return
	}
	if len(req.Title) > 200 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "title too long"})
		return
	}
	if len(req.Solution) > 8000 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "solution too long"})
		return
	}

	post, err := model.GetFAQBoardPostById(req.Id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "post not found"})
		return
	}

	userId := c.GetInt("id")
	if post.UserId != userId {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "permission denied"})
		return
	}

	post.Title = req.Title
	post.Question = req.Question
	post.Solution = req.Solution
	post.Status = model.FAQBoardPostStatusPending
	post.ReviewNote = ""
	post.ReviewedBy = 0
	post.ReviewedAt = 0

	if err := post.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "updated, waiting for re-approval"})
}

func DeleteFAQBoardPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid id"})
		return
	}

	post, err := model.GetFAQBoardPostById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "post not found"})
		return
	}

	userId := c.GetInt("id")
	userRole := c.GetInt("role")
	if post.UserId != userId && userRole < common.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "permission denied"})
		return
	}

	if err := model.DeleteFAQBoardPost(id); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "deleted"})
}

func GetFAQBoardManageList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	if page < 1 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 20
	}

	posts, total, err := model.GetFAQBoardPostsByStatus(status, page, pageSize)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": posts, "total": total})
}

func ApproveFAQBoardPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid id"})
		return
	}

	post, err := model.GetFAQBoardPostById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "post not found"})
		return
	}

	post.Status = model.FAQBoardPostStatusApproved
	post.ReviewedBy = c.GetInt("id")
	post.ReviewedAt = common.GetTimestamp()
	post.ReviewNote = ""

	if err := post.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "approved"})
}

func RejectFAQBoardPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid id"})
		return
	}

	var req FAQBoardReviewRequest
	c.ShouldBindJSON(&req)
	req.ReviewNote = strings.TrimSpace(req.ReviewNote)
	if len(req.ReviewNote) > 500 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "review note too long"})
		return
	}

	post, err := model.GetFAQBoardPostById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "post not found"})
		return
	}

	post.Status = model.FAQBoardPostStatusRejected
	post.ReviewedBy = c.GetInt("id")
	post.ReviewedAt = common.GetTimestamp()
	post.ReviewNote = req.ReviewNote

	if err := post.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "rejected"})
}
