package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type CleanupPreviewResponse struct {
	Count   int64 `json:"count"`
	MinDays int   `json:"min_days"`
	StartId int   `json:"start_id"`
	EndId   int   `json:"end_id"`
}

type CleanupRequest struct {
	MinDays int    `json:"min_days"`
	StartId int    `json:"start_id"`
	EndId   int    `json:"end_id"`
	Reason  string `json:"reason"`
}

func PreviewInactiveUsers(c *gin.Context) {
	minDaysStr := c.DefaultQuery("min_days", "7")
	minDays, err := strconv.Atoi(minDaysStr)
	if err != nil || minDays < 1 {
		minDays = 7
	}

	startIdStr := c.DefaultQuery("start_id", "0")
	startId, _ := strconv.Atoi(startIdStr)

	endIdStr := c.DefaultQuery("end_id", "0")
	endId, _ := strconv.Atoi(endIdStr)

	count, err := model.CountInactiveUsers(minDays, startId, endId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, CleanupPreviewResponse{
		Count:   count,
		MinDays: minDays,
		StartId: startId,
		EndId:   endId,
	})
}

func GetInactiveUsers(c *gin.Context) {
	minDaysStr := c.DefaultQuery("min_days", "7")
	minDays, err := strconv.Atoi(minDaysStr)
	if err != nil || minDays < 1 {
		minDays = 7
	}

	startIdStr := c.DefaultQuery("start_id", "0")
	startId, _ := strconv.Atoi(startIdStr)

	endIdStr := c.DefaultQuery("end_id", "0")
	endId, _ := strconv.Atoi(endIdStr)

	users, err := model.GetInactiveUsers(minDays, startId, endId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, users)
}

func CleanupInactiveUsers(c *gin.Context) {
	var req CleanupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	if req.MinDays < 1 {
		req.MinDays = 7
	}
	if req.Reason == "" {
		req.Reason = "不活跃用户清理"
	}

	adminId := c.GetInt("id")
	count, err := model.BatchArchiveInactiveUsers(req.MinDays, req.StartId, req.EndId, adminId, req.Reason)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, gin.H{
		"cleaned_count": count,
		"message":       "清理完成",
	})
}

func GetAllArchivedUsers(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	users, total, err := model.GetAllArchivedUsers(pageInfo)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(users)

	common.ApiSuccess(c, pageInfo)
}

func SearchArchivedUsers(c *gin.Context) {
	keyword := c.Query("keyword")
	pageInfo := common.GetPageQuery(c)

	users, total, err := model.SearchArchivedUsers(keyword, pageInfo)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(users)

	common.ApiSuccess(c, pageInfo)
}

func GetArchivedUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
		})
		return
	}

	user, err := model.GetArchivedUserById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, user)
}

func RestoreArchivedUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
		})
		return
	}

	if err := model.RestoreArchivedUser(id); err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, gin.H{
		"message": "用户恢复成功",
	})
}

func DeleteArchivedUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
		})
		return
	}

	archived, err := model.GetArchivedUserById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	if err := archived.Delete(); err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, gin.H{
		"message": "归档记录已永久删除",
	})
}
