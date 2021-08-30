package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/AdonisEnProvence/MusicRoom/shared"
	"github.com/AdonisEnProvence/MusicRoom/workflows"

	"github.com/bojanz/httpx"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.temporal.io/sdk/client"
)

type (
	ErrorResponse struct {
		Message string
	}

	UpdateEmailRequest struct {
		Email string
	}

	CheckoutRequest struct {
		Email string
	}
)

var (
	HTTPPort = os.Getenv("PORT")
	temporal client.Client
)

func main() {
	var err error
	temporal, err = client.NewClient(client.Options{})
	if err != nil {
		log.Fatalln("unable to create Temporal client", err)
	}

	r := mux.NewRouter()
	r.Handle("/ping", http.HandlerFunc(PingHandler)).Methods(http.MethodGet)
	r.Handle("/play", http.HandlerFunc(PlayHandler)).Methods(http.MethodPut)
	r.Handle("/pause", http.HandlerFunc(PauseHandler)).Methods(http.MethodPut)
	r.Handle("/create/{workflowID}", http.HandlerFunc(CreateRoomHandler)).Methods(http.MethodPut)
	r.Handle("/join", http.HandlerFunc(JoinRoomHandler)).Methods(http.MethodPut)
	r.Handle("/leave", http.HandlerFunc(LeaveRoomHandler)).Methods(http.MethodPut)
	r.Handle("/change-user-emitting-device", http.HandlerFunc(ChangeUserEmittingDeviceHandler)).Methods(http.MethodPut)
	r.Handle("/state", http.HandlerFunc(GetStateHandler)).Methods(http.MethodPut)
	r.Handle("/go-to-next-track", http.HandlerFunc(GoToNextTrackHandler)).Methods(http.MethodPut)
	r.Handle("/suggest-tracks", http.HandlerFunc(SuggestTracksHandler)).Methods(http.MethodPut)
	r.Handle("/terminate", http.HandlerFunc(TerminateWorkflowHandler)).Methods(http.MethodPut)

	r.NotFoundHandler = http.HandlerFunc(NotFoundHandler)

	var cors = handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))

	http.Handle("/", cors(r))
	server := httpx.NewServer(":"+HTTPPort, http.DefaultServeMux)
	server.WriteTimeout = time.Second * 240

	fmt.Println("Server is listening on PORT: " + os.Getenv("PORT"))
	err = server.Start()
	if err != nil {
		log.Fatal(err)
	}
}

type PlayRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func PlayHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body PlayRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	signal := shared.NewPlaySignal(shared.NewPlaySignalArgs{})
	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		signal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type GoToNextTrackRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func GoToNextTrackHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body GoToNextTrackRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	goToNextTrackSignal := shared.NewGoToNexTrackSignal()
	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		goToNextTrackSignal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type ChangeUserEmittingDeviceRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
	UserID     string `json:"userID" validate:"required,uuid"`
	DeviceID   string `json:"deviceID" validate:"required,uuid"`
}

func ChangeUserEmittingDeviceHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body ChangeUserEmittingDeviceRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	args := shared.ChangeUserEmittingDeviceSignalArgs{
		UserID:   body.UserID,
		DeviceID: body.DeviceID,
	}
	changeUserEmittingDeviceSignal := shared.NewChangeUserEmittingDeviceSignal(args)

	fmt.Println("**********ChangeUserEmittingDeviceHandler**********")

	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		changeUserEmittingDeviceSignal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type SuggestTracksRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`

	TracksToSuggest []string `json:"tracksToSuggest" validate:"required,dive,required"`
	UserID          string   `json:"userID" validate:"required,uuid"`
	DeviceID        string   `json:"deviceID" validate:"required,uuid"`
}

func SuggestTracksHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body SuggestTracksRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	suggestTracksSignal := shared.NewSuggestTracksSignal(shared.SuggestTracksSignalArgs{
		TracksToSuggest: body.TracksToSuggest,
		UserID:          body.UserID,
		DeviceID:        body.DeviceID,
	})
	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		suggestTracksSignal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type TerminateWorkflowRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func TerminateWorkflowHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body TerminateWorkflowRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	terminateSignal := shared.NewTerminateSignal(shared.NewTerminateSignalArgs{})
	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		terminateSignal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type PauseRequestBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func PauseHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body PauseRequestBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	signal := shared.NewPauseSignal(shared.NewPauseSignalArgs{})
	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		signal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type CreateRoomRequestBody struct {
	UserID           string   `json:"userID" validate:"required,uuid"`
	DeviceID         string   `json:"deviceID" validate:"required,uuid"`
	Name             string   `json:"roomName" validate:"required"`
	InitialTracksIDs []string `json:"initialTracksIDs" validate:"required,dive,required"`
}

type CreateRoomResponse struct {
	State      shared.MtvRoomExposedState `json:"state"`
	WorkflowID string                     `json:"workflowID"`
	RunID      string                     `json:"runID"`
}

func CreateRoomHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Create called")
	defer r.Body.Close()

	// Use body
	vars := mux.Vars(r)
	var body CreateRoomRequestBody

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		log.Println("create room validation error", err)
		WriteError(w, err)
		return
	}

	workflowID, err := url.QueryUnescape(vars["workflowID"])
	if err != nil {
		WriteError(w, err)
		return
	}

	options := client.StartWorkflowOptions{
		ID:        workflowID,
		TaskQueue: shared.ControlTaskQueue,
	}

	seedTracksIDs := []string{
		"JK7WLK3ZSu8",
		"9Tfciw7QM3c",
		"H3s1mt7aFlc",
	}
	initialTracksIDsList := append(body.InitialTracksIDs, seedTracksIDs...)

	initialUsers := make(map[string]*shared.InternalStateUser)
	initialUsers[body.UserID] = &shared.InternalStateUser{
		UserID:   body.UserID,
		DeviceID: body.DeviceID,
	}

	params := shared.MtvRoomParameters{
		RoomID:               workflowID,
		RoomCreatorUserID:    body.UserID,
		RoomName:             body.Name,
		InitialUsers:         initialUsers,
		InitialTracksIDsList: initialTracksIDsList,
	}

	we, err := temporal.ExecuteWorkflow(context.Background(), options, workflows.MtvRoomWorkflow, params)
	if err != nil {
		WriteError(w, err)
		return
	}

	res := CreateRoomResponse{
		State:      params.Export(),
		WorkflowID: we.GetID(),
		RunID:      we.GetRunID(),
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}

type UnescapeRoomIDAndRundIDResponse struct {
	worflowID, runID string
}

func UnescapeRoomIDAndRundID(workflowID, runID string) (UnescapeRoomIDAndRundIDResponse, error) {
	workflowID, err := url.QueryUnescape(workflowID)
	if err != nil {
		return UnescapeRoomIDAndRundIDResponse{}, err
	}
	runID, err = url.QueryUnescape(runID)
	if err != nil {
		return UnescapeRoomIDAndRundIDResponse{}, err
	}
	return UnescapeRoomIDAndRundIDResponse{
		workflowID,
		runID,
	}, nil
}

type LeaveRoomHandlerBody JoinRoomHandlerBody

func LeaveRoomHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body LeaveRoomHandlerBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	signal := shared.NewLeaveSignal(shared.NewLeaveSignalArgs{
		UserID: body.UserID,
	})

	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		signal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type JoinRoomHandlerBody struct {
	UserID     string `json:"userID" validate:"required,uuid"`
	DeviceID   string `json:"deviceID" validate:"required,uuid"`
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func JoinRoomHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body JoinRoomHandlerBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	signal := shared.NewJoinSignal(shared.NewJoinSignalArgs{
		UserID:   body.UserID,
		DeviceID: body.DeviceID,
	})

	if err := temporal.SignalWorkflow(
		context.Background(),
		body.WorkflowID,
		body.RunID,
		shared.SignalChannelName,
		signal,
	); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	res := make(map[string]interface{})
	res["ok"] = 1
	json.NewEncoder(w).Encode(res)
}

type GetStateBody struct {
	WorkflowID string `json:"workflowID" validate:"required,uuid"`
	UserID     string `json:"userID,omitempty" validate:"required,uuid"`
	RunID      string `json:"runID" validate:"required,uuid"`
}

func GetStateHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body GetStateBody

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, err)
		return
	}
	if err := validate.Struct(body); err != nil {
		WriteError(w, err)
		return
	}

	response, err := temporal.QueryWorkflow(context.Background(), body.WorkflowID, body.RunID, shared.MtvGetStateQuery, body.UserID)
	if err != nil {
		WriteError(w, err)
		return
	}
	var res interface{}
	if err := response.Get(&res); err != nil {
		WriteError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

func PingHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Pong")
}

func printResults(greeting string, workflowID, runID string) {
	fmt.Printf("\nWorkflowID: %s RunID: %s\n", workflowID, runID)
	fmt.Printf("\n%s\n\n", greeting)
}

func WriteError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	res := ErrorResponse{Message: err.Error()}
	json.NewEncoder(w).Encode(res)
}

func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	res := ErrorResponse{Message: "Endpoint not found"}
	json.NewEncoder(w).Encode(res)
}
